/**
 * Module 8 — Membership management: tiers, lifecycle, verification, cards.
 */
const { Op } = require('sequelize');
const {
  Membership,
  MembershipTier,
  Visitor,
  VisitLog,
  VisitorCommunication,
} = require('../models');
const { generateMembershipQR } = require('../services/qrService');
const { generateMembershipNumber } = require('../utils/referenceGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');

const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const MEMBERSHIP_INCLUDE = [
  { model: MembershipTier, as: 'tier' },
  { model: Visitor },
];

// ─── Memberships ────────────────────────────────────────────────

/** POST /api/memberships */
const createMembership = async (req, res) => {
  try {
    const { visitor_id, tier_id, payment_method, payment_reference, auto_renew } = req.body;
    if (!visitor_id || !tier_id) {
      return sendError(res, 400, 'visitor_id and tier_id are required');
    }

    const visitor = await Visitor.findByPk(visitor_id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    const tier = await MembershipTier.findByPk(tier_id);
    if (!tier || !tier.is_active) {
      return sendError(res, 404, 'Membership tier not found or inactive');
    }

    const startDate = req.body.start_date || todayDateOnly();
    const endDate = addMonths(startDate, tier.duration_months);
    const membershipNumber = generateMembershipNumber();
    const { qrCode } = await generateMembershipQR();

    const membership = await Membership.create({
      membership_number: membershipNumber,
      visitor_id: visitor.id,
      tier_id: tier.id,
      status: 'active',
      start_date: startDate,
      end_date: endDate,
      price_paid: req.body.price_paid !== undefined ? req.body.price_paid : tier.price_etb,
      payment_method: payment_method || null,
      payment_reference: payment_reference || null,
      auto_renew: Boolean(auto_renew),
      qr_code: qrCode,
      card_issued: true,
      created_by: req.user?.id || null,
    });

    await visitor.update({ visitor_type: 'member' });

    await writeAuditLog({
      userId: req.user?.id,
      action: 'CREATE',
      tableName: 'memberships',
      recordId: membership.id,
      newValues: membership.get({ plain: true }),
      ipAddress: req.ip,
    });

    const withTier = await Membership.findByPk(membership.id, { include: MEMBERSHIP_INCLUDE });
    return sendSuccess(res, 201, 'Membership created successfully', { membership: withTier });
  } catch (error) {
    return sendError(res, 500, 'Failed to create membership', error.message);
  }
};

/** GET /api/memberships */
const listMemberships = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, tier_id, visitor_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (tier_id) where.tier_id = tier_id;
    if (visitor_id) where.visitor_id = visitor_id;

    const paging = paginate(page, limit);
    const { count, rows } = await Membership.findAndCountAll({
      where,
      include: MEMBERSHIP_INCLUDE,
      order: [['created_at', 'DESC']],
      ...paging,
    });

    return sendSuccess(res, 200, 'Memberships retrieved', {
      memberships: rows,
      pagination: {
        total: count,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve memberships', error.message);
  }
};

/** GET /api/memberships/:id */
const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id, { include: MEMBERSHIP_INCLUDE });
    if (!membership) {
      return sendError(res, 404, 'Membership not found');
    }
    return sendSuccess(res, 200, 'Membership retrieved', { membership });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve membership', error.message);
  }
};

/** PUT /api/memberships/:id */
const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) {
      return sendError(res, 404, 'Membership not found');
    }

    const oldValues = membership.get({ plain: true });
    const fields = [
      'status',
      'start_date',
      'end_date',
      'price_paid',
      'payment_method',
      'payment_reference',
      'auto_renew',
      'tier_id',
    ];
    const payload = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    await membership.update(payload);

    await writeAuditLog({
      userId: req.user?.id,
      action: 'UPDATE',
      tableName: 'memberships',
      recordId: membership.id,
      oldValues,
      newValues: payload,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Membership updated successfully', { membership });
  } catch (error) {
    return sendError(res, 500, 'Failed to update membership', error.message);
  }
};

/** GET /api/memberships/verify/:code — gate check */
const verifyMembership = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim();
    const membership = await Membership.findOne({
      where: { qr_code: code },
      include: MEMBERSHIP_INCLUDE,
    });

    if (!membership) {
      return sendSuccess(res, 200, 'Membership verification complete', {
        valid: false,
        membership: null,
        message: 'Invalid membership code',
      });
    }

    if (!membership.isActive()) {
      return sendSuccess(res, 200, 'Membership verification complete', {
        valid: false,
        membership,
        message: membership.status === 'active' ? 'Membership expired' : 'Membership not active',
      });
    }

    const visitLog = await VisitLog.create({
      visitor_id: membership.visitor_id,
      staff_id: req.user?.id || null,
      entry_method: 'membership_card',
      visitor_count: 1,
      purpose: 'membership_entry',
    });

    const visitor = await Visitor.findByPk(membership.visitor_id);
    if (visitor) {
      await visitor.update({
        total_visits: visitor.total_visits + 1,
        last_visit_at: new Date(),
      });
    }

    return sendSuccess(res, 200, 'Membership verification complete', {
      valid: true,
      membership,
      visit_log: visitLog,
      message: 'Valid membership — free entry granted',
    });
  } catch (error) {
    return sendError(res, 500, 'Membership verification failed', error.message);
  }
};

/** POST /api/memberships/:id/renew */
const renewMembership = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id, { include: MEMBERSHIP_INCLUDE });
    if (!membership) {
      return sendError(res, 404, 'Membership not found');
    }
    const tier = membership.tier || (await MembershipTier.findByPk(membership.tier_id));
    if (!tier) {
      return sendError(res, 404, 'Membership tier not found');
    }

    const baseDate = membership.end_date > todayDateOnly() ? membership.end_date : todayDateOnly();
    const newEndDate = addMonths(baseDate, tier.duration_months);
    const pricePaid = req.body.price_paid !== undefined ? req.body.price_paid : tier.price_etb;

    await membership.update({
      status: 'active',
      end_date: newEndDate,
      price_paid: Number(membership.price_paid || 0) + Number(pricePaid || 0),
      payment_method: req.body.payment_method || membership.payment_method,
      payment_reference: req.body.payment_reference || membership.payment_reference,
      renewal_reminder_sent_at: null,
      cancelled_at: null,
      cancellation_reason: null,
    });

    await writeAuditLog({
      userId: req.user?.id,
      action: 'RENEW',
      tableName: 'memberships',
      recordId: membership.id,
      newValues: { end_date: newEndDate },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Membership renewed successfully', { membership });
  } catch (error) {
    return sendError(res, 500, 'Failed to renew membership', error.message);
  }
};

/** POST /api/memberships/:id/cancel */
const cancelMembership = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id);
    if (!membership) {
      return sendError(res, 404, 'Membership not found');
    }

    await membership.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: req.body.reason || null,
    });

    await writeAuditLog({
      userId: req.user?.id,
      action: 'CANCEL',
      tableName: 'memberships',
      recordId: membership.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Membership cancelled successfully', { membership });
  } catch (error) {
    return sendError(res, 500, 'Failed to cancel membership', error.message);
  }
};

/** GET /api/memberships/expiring?days=30 */
const getExpiringMemberships = async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const today = todayDateOnly();
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureDateOnly = future.toISOString().slice(0, 10);

    const memberships = await Membership.findAll({
      where: {
        status: 'active',
        end_date: { [Op.gte]: today, [Op.lte]: futureDateOnly },
      },
      include: MEMBERSHIP_INCLUDE,
      order: [['end_date', 'ASC']],
    });

    return sendSuccess(res, 200, 'Expiring memberships retrieved', { memberships });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve expiring memberships', error.message);
  }
};

/** POST /api/memberships/renewal-reminders */
const sendRenewalReminders = async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.body.days, 10) || 30));
    const today = todayDateOnly();
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureDateOnly = future.toISOString().slice(0, 10);

    const memberships = await Membership.findAll({
      where: {
        status: 'active',
        end_date: { [Op.gte]: today, [Op.lte]: futureDateOnly },
      },
      include: [{ model: Visitor }, { model: MembershipTier, as: 'tier' }],
    });

    const sent = [];
    for (const membership of memberships) {
      if (!membership.Visitor) continue;
      const daysLeft = membership.daysUntilExpiry();
      const message = `Dear ${membership.Visitor.getFullName()}, your ${
        membership.tier?.name || 'museum'
      } membership (${membership.membership_number}) expires in ${daysLeft} day(s). Renew to keep your benefits.`;

      await VisitorCommunication.create({
        visitor_id: membership.visitor_id,
        channel: 'email',
        type: 'renewal_reminder',
        subject: 'Membership Renewal Reminder',
        message,
        status: 'sent',
      });

      await membership.update({ renewal_reminder_sent_at: new Date() });
      sent.push(membership.membership_number);
    }

    return sendSuccess(res, 200, 'Renewal reminders sent', {
      reminders_sent: sent.length,
      membership_numbers: sent,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to send renewal reminders', error.message);
  }
};

/** GET /api/memberships/:id/card — public digital card */
const getMembershipCard = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id, { include: MEMBERSHIP_INCLUDE });
    if (!membership) {
      return sendError(res, 404, 'Membership not found');
    }

    const { qrDataUrl } = await generateMembershipQR(membership.qr_code);

    return sendSuccess(res, 200, 'Membership card retrieved', {
      card: {
        membership_number: membership.membership_number,
        visitor_name: membership.Visitor ? membership.Visitor.getFullName() : null,
        tier: membership.tier ? membership.tier.name : null,
        status: membership.status,
        start_date: membership.start_date,
        end_date: membership.end_date,
        is_active: membership.isActive(),
        qr_code: membership.qr_code,
        qr_data_url: qrDataUrl,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve membership card', error.message);
  }
};

// ─── Membership Tiers ───────────────────────────────────────────

/** GET /api/memberships/tiers (also GET /api/membership-tiers) */
const listTiers = async (req, res) => {
  try {
    const where = {};
    if (!req.query.all) where.is_active = true;
    const tiers = await MembershipTier.findAll({
      where,
      order: [['display_order', 'ASC'], ['price_etb', 'ASC']],
    });
    return sendSuccess(res, 200, 'Membership tiers retrieved', { tiers });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve membership tiers', error.message);
  }
};

/** GET /api/memberships/tiers/:id */
const getTierById = async (req, res) => {
  try {
    const tier = await MembershipTier.findByPk(req.params.id);
    if (!tier) {
      return sendError(res, 404, 'Membership tier not found');
    }
    return sendSuccess(res, 200, 'Membership tier retrieved', { tier });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve membership tier', error.message);
  }
};

/** POST /api/memberships/tiers */
const createTier = async (req, res) => {
  try {
    const { name, price_etb, duration_months } = req.body;
    if (!name || price_etb === undefined) {
      return sendError(res, 400, 'name and price_etb are required');
    }
    const slug = String(name).trim().toLowerCase().replace(/\s+/g, '-');
    const existing = await MembershipTier.findOne({ where: { slug } });
    if (existing) {
      return sendError(res, 400, 'A membership tier with this name already exists');
    }

    const tier = await MembershipTier.create({
      name: String(name).trim(),
      slug,
      description: req.body.description || null,
      price_etb: Number(price_etb),
      duration_months: duration_months ? Number(duration_months) : 12,
      benefits: Array.isArray(req.body.benefits) ? req.body.benefits : [],
      max_guests: req.body.max_guests ? Number(req.body.max_guests) : 0,
      discount_percent: req.body.discount_percent ? Number(req.body.discount_percent) : 0,
      is_active: req.body.is_active !== undefined ? Boolean(req.body.is_active) : true,
      display_order: req.body.display_order ? Number(req.body.display_order) : 0,
    });

    return sendSuccess(res, 201, 'Membership tier created successfully', { tier });
  } catch (error) {
    return sendError(res, 500, 'Failed to create membership tier', error.message);
  }
};

/** PUT /api/memberships/tiers/:id */
const updateTier = async (req, res) => {
  try {
    const tier = await MembershipTier.findByPk(req.params.id);
    if (!tier) {
      return sendError(res, 404, 'Membership tier not found');
    }

    const fields = [
      'name',
      'description',
      'price_etb',
      'duration_months',
      'benefits',
      'max_guests',
      'discount_percent',
      'is_active',
      'display_order',
    ];
    const payload = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    if (payload.name) {
      payload.slug = String(payload.name).trim().toLowerCase().replace(/\s+/g, '-');
    }

    await tier.update(payload);
    return sendSuccess(res, 200, 'Membership tier updated successfully', { tier });
  } catch (error) {
    return sendError(res, 500, 'Failed to update membership tier', error.message);
  }
};

/** DELETE /api/memberships/tiers/:id */
const deleteTier = async (req, res) => {
  try {
    const tier = await MembershipTier.findByPk(req.params.id);
    if (!tier) {
      return sendError(res, 404, 'Membership tier not found');
    }
    const inUse = await Membership.count({ where: { tier_id: tier.id } });
    if (inUse > 0) {
      await tier.update({ is_active: false });
      return sendSuccess(res, 200, 'Membership tier deactivated (in use by existing memberships)', { tier });
    }
    await tier.destroy();
    return sendSuccess(res, 200, 'Membership tier deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete membership tier', error.message);
  }
};

module.exports = {
  createMembership,
  listMemberships,
  getMembershipById,
  updateMembership,
  verifyMembership,
  renewMembership,
  cancelMembership,
  getExpiringMemberships,
  sendRenewalReminders,
  getMembershipCard,
  listTiers,
  getTierById,
  createTier,
  updateTier,
  deleteTier,
};

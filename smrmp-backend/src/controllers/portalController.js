/**
 * Visitor Portal — self-scoped APIs. Always resolve data via req.user.id.
 * Never accept arbitrary visitor_id from the client for "my" resources.
 */
const { Op } = require('sequelize');
const {
  User,
  Visitor,
  Membership,
  MembershipTier,
  VisitLog,
  Ticket,
  GroupBooking,
} = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ensureVisitorForUser } = require('../services/visitorProfileService');
const { generateMembershipQR } = require('../services/qrService');
const { writeAuditLog } = require('../middleware/auditLogger');

const getDashboard = async (req, res) => {
  try {
    const visitor = await ensureVisitorForUser(req.user);
    const membership = await Membership.findOne({
      where: { visitor_id: visitor.id, status: 'active' },
      include: [{ model: MembershipTier, as: 'tier' }],
      order: [['end_date', 'DESC']],
    });

    const [visitCount, openBookings, recentTickets] = await Promise.all([
      VisitLog.count({ where: { visitor_id: visitor.id } }),
      GroupBooking.count({
        where: {
          contact_email: { [Op.iLike]: req.user.email || '' },
          status: { [Op.in]: ['pending', 'confirmed'] },
        },
      }),
      Ticket.count({
        where: {
          [Op.or]: [
            { purchased_by_user_id: req.user.id },
            ...(req.user.phone
              ? [{ visitor_phone: { [Op.iLike]: String(req.user.phone).trim() } }]
              : []),
          ],
        },
      }),
    ]);

    return sendSuccess(res, 200, 'Portal dashboard retrieved', {
      dashboard: {
        welcome_name: visitor.getFullName() || req.user.name,
        visitor_id: visitor.id,
        membership: membership
          ? {
              id: membership.id,
              membership_number: membership.membership_number,
              status: membership.status,
              start_date: membership.start_date,
              end_date: membership.end_date,
              days_remaining: membership.daysUntilExpiry(),
              is_active: membership.isActive(),
              tier: membership.tier
                ? {
                    name: membership.tier.name,
                    slug: membership.tier.slug,
                    benefits: membership.tier.benefits,
                  }
                : null,
            }
          : null,
        stats: {
          total_visits: visitor.total_visits || visitCount,
          open_bookings: openBookings,
          tickets: recentTickets,
        },
        // Actions not already primary nav items (avoid duplicate destinations)
        quick_links: [
          { label: 'Buy tickets', path: '/portal/tickets/buy' },
          { label: 'Book a group visit', path: '/portal/bookings/new' },
          { label: 'Leave feedback', path: '/portal/feedback' },
        ],
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load portal dashboard', error.message);
  }
};

const getMyProfile = async (req, res) => {
  try {
    const visitor = await ensureVisitorForUser(req.user);
    const user = await User.findByPk(req.user.id);
    return sendSuccess(res, 200, 'Profile retrieved', {
      profile: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || visitor.phone,
        gender: user.gender || visitor.gender,
        date_of_birth: user.date_of_birth || visitor.date_of_birth,
        nationality: user.nationality || visitor.nationality,
        national_id: user.national_id || visitor.national_id,
        visitor_id: visitor.id,
        visitor_type: visitor.visitor_type,
        preferred_language: visitor.preferred_language,
        marketing_opt_in: visitor.marketing_opt_in,
        address: visitor.address,
        total_visits: visitor.total_visits,
        last_visit_at: visitor.last_visit_at,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load profile', error.message);
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const visitor = await ensureVisitorForUser(req.user);
    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    const {
      name,
      phone,
      gender,
      date_of_birth,
      nationality,
      address,
      preferred_language,
      marketing_opt_in,
    } = req.body;

    const userPatch = {};
    if (name !== undefined) userPatch.name = String(name).trim();
    if (phone !== undefined) userPatch.phone = String(phone).trim();
    if (gender !== undefined) userPatch.gender = gender;
    if (date_of_birth !== undefined) userPatch.date_of_birth = date_of_birth;
    if (nationality !== undefined) userPatch.nationality = String(nationality).trim();

    if (Object.keys(userPatch).length) {
      await user.update(userPatch);
    }

    const visitorPatch = {};
    if (phone !== undefined) visitorPatch.phone = String(phone).trim();
    if (gender !== undefined) visitorPatch.gender = gender;
    if (date_of_birth !== undefined) visitorPatch.date_of_birth = date_of_birth;
    if (nationality !== undefined) visitorPatch.nationality = String(nationality).trim();
    if (address !== undefined) visitorPatch.address = address;
    if (preferred_language !== undefined) visitorPatch.preferred_language = preferred_language;
    if (marketing_opt_in !== undefined) visitorPatch.marketing_opt_in = Boolean(marketing_opt_in);
    if (name !== undefined) {
      const parts = String(name).trim().split(/\s+/);
      visitorPatch.first_name = parts[0] || visitor.first_name;
      visitorPatch.last_name = parts.slice(1).join(' ') || null;
    }

    if (Object.keys(visitorPatch).length) {
      await visitor.update(visitorPatch);
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      tableName: 'visitors',
      recordId: visitor.id,
      newValues: visitorPatch,
      ipAddress: req.ip,
    });

    return getMyProfile(req, res);
  } catch (error) {
    return sendError(res, 500, 'Failed to update profile', error.message);
  }
};

const getMyMemberships = async (req, res) => {
  try {
    const visitor = await ensureVisitorForUser(req.user);
    const memberships = await Membership.findAll({
      where: { visitor_id: visitor.id },
      include: [{ model: MembershipTier, as: 'tier' }],
      order: [['created_at', 'DESC']],
    });

    const active = memberships.find((m) => m.isActive()) || null;
    let card = null;
    if (active) {
      const { qrDataUrl } = await generateMembershipQR(active.qr_code);
      card = {
        membership_id: active.id,
        membership_number: active.membership_number,
        visitor_name: visitor.getFullName(),
        tier: active.tier?.name,
        status: active.status,
        start_date: active.start_date,
        end_date: active.end_date,
        is_active: true,
        qr_code: active.qr_code,
        qr_data_url: qrDataUrl,
        card_url: `/membership/${active.id}/card`,
      };
    }

    return sendSuccess(res, 200, 'Memberships retrieved', {
      memberships,
      active_membership: active,
      card,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load memberships', error.message);
  }
};

const getMyVisits = async (req, res) => {
  try {
    const visitor = await ensureVisitorForUser(req.user);
    const visits = await VisitLog.findAll({
      where: { visitor_id: visitor.id },
      order: [['entry_time', 'DESC']],
      limit: 100,
    });
    return sendSuccess(res, 200, 'Visit history retrieved', {
      visits,
      total_visits: visitor.total_visits,
      last_visit_at: visitor.last_visit_at,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load visits', error.message);
  }
};

const getMyTickets = async (req, res) => {
  try {
    const conditions = [{ purchased_by_user_id: req.user.id }];
    if (req.user.phone) {
      const cleanPhone = String(req.user.phone).trim();
      conditions.push({ visitor_phone: { [Op.iLike]: cleanPhone } });
      const digits = cleanPhone.replace(/\D/g, '');
      if (digits.length >= 9) {
        conditions.push({ visitor_phone: { [Op.iLike]: `%${digits.slice(-9)}%` } });
      }
    }

    const tickets = await Ticket.findAll({
      where: { [Op.or]: conditions },
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    return sendSuccess(res, 200, 'Tickets retrieved', { tickets });
  } catch (error) {
    return sendError(res, 500, 'Failed to load tickets', error.message);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const conditions = [{ created_by: req.user.id }];
    if (req.user.email) {
      conditions.push({ contact_email: { [Op.iLike]: req.user.email.trim() } });
    }
    if (req.user.phone) {
      const cleanPhone = String(req.user.phone).trim();
      conditions.push({ contact_phone: { [Op.iLike]: cleanPhone } });
      const digits = cleanPhone.replace(/\D/g, '');
      if (digits.length >= 9) {
        conditions.push({ contact_phone: { [Op.iLike]: `%${digits.slice(-9)}%` } });
      }
    }

    const bookings = await GroupBooking.findAll({
      where: { [Op.or]: conditions },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    return sendSuccess(res, 200, 'Bookings retrieved', { bookings });
  } catch (error) {
    return sendError(res, 500, 'Failed to load bookings', error.message);
  }
};

module.exports = {
  getDashboard,
  getMyProfile,
  updateMyProfile,
  getMyMemberships,
  getMyVisits,
  getMyTickets,
  getMyBookings,
};

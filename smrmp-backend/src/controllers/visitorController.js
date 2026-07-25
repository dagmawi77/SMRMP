/**
 * Module 8 — Visitor management: CRUD, check-in, search, analytics.
 */
const { Op, fn, col } = require('sequelize');
const {
  Visitor,
  VisitLog,
  Membership,
  MembershipTier,
  VisitorFeedback,
  VisitorCommunication,
  User,
} = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');
const { daysAgo, startOfDay } = require('../utils/dateHelpers');

const toCount = (value) => Number(value) || 0;

const buildVisitorPayload = (body = {}) => {
  const payload = {};
  const fields = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'gender',
    'date_of_birth',
    'nationality',
    'national_id',
    'address',
    'visitor_type',
    'photo_url',
    'preferred_language',
    'marketing_opt_in',
    'is_blacklisted',
    'notes',
    'user_account_id',
  ];
  for (const field of fields) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  return payload;
};

/** GET /api/visitors */
const listVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 20, visitor_type, is_blacklisted, search } = req.query;
    const where = {};
    if (visitor_type) where.visitor_type = visitor_type;
    if (is_blacklisted !== undefined) where.is_blacklisted = is_blacklisted === 'true';
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const paging = paginate(page, limit);
    const { count, rows } = await Visitor.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      ...paging,
    });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    return sendSuccess(res, 200, 'Visitors retrieved', {
      visitors: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitors', error.message);
  }
};

/** GET /api/visitors/search?q= */
const searchVisitors = async (req, res) => {
  try {
    const q = String(req.query.q || req.query.search || '').trim();
    if (!q) {
      return sendSuccess(res, 200, 'Visitors retrieved', { visitors: [] });
    }
    const visitors = await Visitor.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${q}%` } },
          { last_name: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
          { phone: { [Op.iLike]: `%${q}%` } },
          { national_id: { [Op.iLike]: `%${q}%` } },
        ],
      },
      order: [['created_at', 'DESC']],
      limit: 25,
    });
    return sendSuccess(res, 200, 'Visitors retrieved', { visitors });
  } catch (error) {
    return sendError(res, 500, 'Failed to search visitors', error.message);
  }
};

/** POST /api/visitors */
const createVisitor = async (req, res) => {
  try {
    const { first_name } = req.body;
    if (!first_name || !String(first_name).trim()) {
      return sendError(res, 400, 'first_name is required');
    }

    const payload = buildVisitorPayload(req.body);
    payload.registered_by = req.user?.id || null;

    const visitor = await Visitor.create(payload);

    const saveOnly = req.body.save_only === true || req.body.save_only === 'true';
    const shouldCheckIn = req.body.check_in !== false && req.body.check_in !== 'false' && !saveOnly;

    let visitLog = null;
    if (shouldCheckIn && req.user?.id) {
      visitLog = await VisitLog.create({
        visitor_id: visitor.id,
        staff_id: req.user.id,
        entry_method: req.body.entry_method || 'staff_assisted',
        visitor_count: req.body.visitor_count || 1,
        purpose: req.body.purpose || null,
      });
      await visitor.update({
        total_visits: visitor.total_visits + 1,
        last_visit_at: new Date(),
      });
    }

    await writeAuditLog({
      userId: req.user?.id,
      action: 'CREATE',
      tableName: 'visitors',
      recordId: visitor.id,
      newValues: payload,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Visitor created successfully', {
      visitor,
      visit_log: visitLog,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to create visitor', error.message);
  }
};

/** GET /api/visitors/:id */
const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    return sendSuccess(res, 200, 'Visitor retrieved', { visitor });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor', error.message);
  }
};

/** PUT /api/visitors/:id */
const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }

    const oldValues = visitor.get({ plain: true });
    const payload = buildVisitorPayload(req.body);
    await visitor.update(payload);

    await writeAuditLog({
      userId: req.user?.id,
      action: 'UPDATE',
      tableName: 'visitors',
      recordId: visitor.id,
      oldValues,
      newValues: payload,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Visitor updated successfully', { visitor });
  } catch (error) {
    return sendError(res, 500, 'Failed to update visitor', error.message);
  }
};

/** DELETE /api/visitors/:id */
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }

    await visitor.destroy();

    await writeAuditLog({
      userId: req.user?.id,
      action: 'DELETE',
      tableName: 'visitors',
      recordId: visitor.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Visitor deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete visitor', error.message);
  }
};

/** POST /api/visitors/:id/checkin */
const checkInVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    if (visitor.is_blacklisted) {
      return sendError(res, 403, 'Visitor is blacklisted and cannot be checked in');
    }

    const visitLog = await VisitLog.create({
      visitor_id: visitor.id,
      staff_id: req.user?.id || null,
      entry_method: req.body.entry_method || 'staff_assisted',
      visitor_count: req.body.visitor_count || 1,
      purpose: req.body.purpose || null,
      notes: req.body.notes || null,
    });

    await visitor.update({
      total_visits: visitor.total_visits + 1,
      last_visit_at: new Date(),
    });

    return sendSuccess(res, 201, 'Visitor checked in successfully', {
      visit_log: visitLog,
      visitor,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to check in visitor', error.message);
  }
};

/** GET /api/visitors/:id/visits */
const getVisitorVisits = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    const { page = 1, limit = 20 } = req.query;
    const paging = paginate(page, limit);
    const { count, rows } = await VisitLog.findAndCountAll({
      where: { visitor_id: visitor.id },
      order: [['entry_time', 'DESC']],
      include: [{ model: User, as: 'staff', attributes: ['id', 'name'] }],
      ...paging,
    });

    return sendSuccess(res, 200, 'Visitor visits retrieved', {
      visits: rows,
      pagination: {
        total: count,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor visits', error.message);
  }
};

/** GET /api/visitors/:id/memberships */
const getVisitorMemberships = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    const memberships = await Membership.findAll({
      where: { visitor_id: visitor.id },
      include: [{ model: MembershipTier, as: 'tier' }],
      order: [['created_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'Visitor memberships retrieved', { memberships });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor memberships', error.message);
  }
};

/** GET /api/visitors/:id/feedback */
const getVisitorFeedback = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    const feedback = await VisitorFeedback.findAll({
      where: { visitor_id: visitor.id },
      order: [['created_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'Visitor feedback retrieved', { feedback });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor feedback', error.message);
  }
};

/** GET /api/visitors/:id/communications */
const getVisitorCommunications = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) {
      return sendError(res, 404, 'Visitor not found');
    }
    const communications = await VisitorCommunication.findAll({
      where: { visitor_id: visitor.id },
      order: [['sent_at', 'DESC']],
    });
    return sendSuccess(res, 200, 'Visitor communications retrieved', { communications });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor communications', error.message);
  }
};

/** GET /api/visitors/analytics/summary */
const getVisitorAnalyticsSummary = async (req, res) => {
  try {
    const today = startOfDay();
    const [
      totalVisitors,
      visitorsToday,
      totalVisits,
      activeMemberships,
      blacklistedCount,
    ] = await Promise.all([
      Visitor.count(),
      VisitLog.count({ where: { entry_time: { [Op.gte]: today } } }),
      VisitLog.count(),
      Membership.count({ where: { status: 'active' } }),
      Visitor.count({ where: { is_blacklisted: true } }),
    ]);

    return sendSuccess(res, 200, 'Visitor analytics summary retrieved', {
      summary: {
        total_visitors: totalVisitors,
        visitors_today: visitorsToday,
        total_visits: totalVisits,
        active_memberships: activeMemberships,
        blacklisted_visitors: blacklistedCount,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor analytics summary', error.message);
  }
};

/** GET /api/visitors/analytics/trends?days=30 */
const getVisitorAnalyticsTrends = async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const trend = await VisitLog.findAll({
      attributes: [
        [fn('DATE', col('entry_time')), 'date'],
        [fn('SUM', col('visitor_count')), 'visitors'],
        [fn('COUNT', col('id')), 'entries'],
      ],
      where: { entry_time: { [Op.gte]: daysAgo(days) } },
      group: [fn('DATE', col('entry_time'))],
      order: [[fn('DATE', col('entry_time')), 'ASC']],
      raw: true,
    });

    return sendSuccess(res, 200, 'Visitor analytics trends retrieved', {
      trend: trend.map((row) => ({
        date: row.date,
        visitors: toCount(row.visitors),
        entries: toCount(row.entries),
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor analytics trends', error.message);
  }
};

/** GET /api/visitors/analytics/segments */
const getVisitorAnalyticsSegments = async (req, res) => {
  try {
    const byType = await Visitor.findAll({
      attributes: ['visitor_type', [fn('COUNT', col('id')), 'count']],
      group: ['visitor_type'],
      raw: true,
    });

    const byEntryMethod = await VisitLog.findAll({
      attributes: ['entry_method', [fn('COUNT', col('id')), 'count']],
      group: ['entry_method'],
      raw: true,
    });

    return sendSuccess(res, 200, 'Visitor analytics segments retrieved', {
      by_visitor_type: byType.map((row) => ({
        visitor_type: row.visitor_type,
        count: toCount(row.count),
      })),
      by_entry_method: byEntryMethod.map((row) => ({
        entry_method: row.entry_method,
        count: toCount(row.count),
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor analytics segments', error.message);
  }
};

/** GET /api/visitors/analytics/feedback */
const getVisitorAnalyticsFeedback = async (req, res) => {
  try {
    const [avgRatingRow] = await VisitorFeedback.findAll({
      attributes: [[fn('AVG', col('rating')), 'avg_rating'], [fn('COUNT', col('id')), 'total']],
      raw: true,
    });

    const bySentiment = await VisitorFeedback.findAll({
      attributes: ['sentiment', [fn('COUNT', col('id')), 'count']],
      where: { sentiment: { [Op.ne]: null } },
      group: ['sentiment'],
      raw: true,
    });

    const byCategory = await VisitorFeedback.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    return sendSuccess(res, 200, 'Visitor feedback analytics retrieved', {
      average_rating: avgRatingRow?.avg_rating ? Number(avgRatingRow.avg_rating).toFixed(2) : null,
      total_feedback: toCount(avgRatingRow?.total),
      by_sentiment: bySentiment.map((row) => ({
        sentiment: row.sentiment,
        count: toCount(row.count),
      })),
      by_category: byCategory.map((row) => ({
        category: row.category,
        count: toCount(row.count),
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visitor feedback analytics', error.message);
  }
};

module.exports = {
  listVisitors,
  createVisitor,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  checkInVisitor,
  getVisitorVisits,
  getVisitorMemberships,
  getVisitorFeedback,
  getVisitorCommunications,
  searchVisitors,
  getVisitorAnalyticsSummary,
  getVisitorAnalyticsTrends,
  getVisitorAnalyticsSegments,
  getVisitorAnalyticsFeedback,
};

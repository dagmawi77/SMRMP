/**
 * Module 8 — Gate visit log listing, manual entry, and analytics.
 */
const { Op, fn, col } = require('sequelize');
const { VisitLog, Visitor, Ticket, GroupBooking, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { startOfDay, daysAgo } = require('../utils/dateHelpers');

const toCount = (value) => Number(value) || 0;

const VISIT_LOG_INCLUDE = [
  { model: Visitor, attributes: ['id', 'first_name', 'last_name'] },
  { model: Ticket, attributes: ['id', 'qr_ticket_code', 'ticket_type'] },
  { model: GroupBooking, attributes: ['id', 'booking_reference', 'group_name'] },
  { model: User, as: 'staff', attributes: ['id', 'name'] },
];

/** GET /api/visit-logs */
const listVisitLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, visitor_id, entry_method, from, to } = req.query;
    const where = {};
    if (visitor_id) where.visitor_id = visitor_id;
    if (entry_method) where.entry_method = entry_method;
    if (from || to) {
      where.entry_time = {};
      if (from) where.entry_time[Op.gte] = new Date(from);
      if (to) where.entry_time[Op.lte] = new Date(to);
    }

    const paging = paginate(page, limit);
    const { count, rows } = await VisitLog.findAndCountAll({
      where,
      include: VISIT_LOG_INCLUDE,
      order: [['entry_time', 'DESC']],
      ...paging,
    });

    return sendSuccess(res, 200, 'Visit logs retrieved', {
      visit_logs: rows,
      pagination: {
        total: count,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visit logs', error.message);
  }
};

/** POST /api/visit-logs — manual staff entry (cash counter, comp, etc.) */
const createVisitLog = async (req, res) => {
  try {
    const { entry_method } = req.body;
    if (!entry_method) {
      return sendError(res, 400, 'entry_method is required');
    }
    if (!VisitLog.ENTRY_METHODS.includes(entry_method)) {
      return sendError(res, 400, `entry_method must be one of: ${VisitLog.ENTRY_METHODS.join(', ')}`);
    }

    const visitLog = await VisitLog.create({
      visitor_id: req.body.visitor_id || null,
      ticket_id: req.body.ticket_id || null,
      group_booking_id: req.body.group_booking_id || null,
      staff_id: req.user?.id || null,
      entry_method,
      visitor_count: req.body.visitor_count ? Number(req.body.visitor_count) : 1,
      purpose: req.body.purpose || null,
      notes: req.body.notes || null,
    });

    if (visitLog.visitor_id) {
      const visitor = await Visitor.findByPk(visitLog.visitor_id);
      if (visitor) {
        await visitor.update({
          total_visits: visitor.total_visits + 1,
          last_visit_at: new Date(),
        });
      }
    }

    return sendSuccess(res, 201, 'Visit log created successfully', { visit_log: visitLog });
  } catch (error) {
    return sendError(res, 500, 'Failed to create visit log', error.message);
  }
};

/** GET /api/visit-logs/today */
const getTodaysVisitLogs = async (req, res) => {
  try {
    const visitLogs = await VisitLog.findAll({
      where: { entry_time: { [Op.gte]: startOfDay() } },
      include: VISIT_LOG_INCLUDE,
      order: [['entry_time', 'DESC']],
    });

    const totalVisitors = visitLogs.reduce((sum, log) => sum + toCount(log.visitor_count), 0);

    return sendSuccess(res, 200, "Today's visit logs retrieved", {
      visit_logs: visitLogs,
      total_entries: visitLogs.length,
      total_visitors: totalVisitors,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to retrieve today's visit logs", error.message);
  }
};

/** GET /api/visit-logs/analytics?days=30 */
const getVisitLogAnalytics = async (req, res) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));

    const byEntryMethod = await VisitLog.findAll({
      attributes: ['entry_method', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('visitor_count')), 'visitors']],
      where: { entry_time: { [Op.gte]: daysAgo(days) } },
      group: ['entry_method'],
      raw: true,
    });

    const trend = await VisitLog.findAll({
      attributes: [
        [fn('DATE', col('entry_time')), 'date'],
        [fn('COUNT', col('id')), 'entries'],
        [fn('SUM', col('visitor_count')), 'visitors'],
      ],
      where: { entry_time: { [Op.gte]: daysAgo(days) } },
      group: [fn('DATE', col('entry_time'))],
      order: [[fn('DATE', col('entry_time')), 'ASC']],
      raw: true,
    });

    const totalEntries = await VisitLog.count({ where: { entry_time: { [Op.gte]: daysAgo(days) } } });

    return sendSuccess(res, 200, 'Visit log analytics retrieved', {
      total_entries: totalEntries,
      by_entry_method: byEntryMethod.map((row) => ({
        entry_method: row.entry_method,
        count: toCount(row.count),
        visitors: toCount(row.visitors),
      })),
      trend: trend.map((row) => ({
        date: row.date,
        entries: toCount(row.entries),
        visitors: toCount(row.visitors),
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve visit log analytics', error.message);
  }
};

module.exports = {
  listVisitLogs,
  createVisitLog,
  getTodaysVisitLogs,
  getVisitLogAnalytics,
};

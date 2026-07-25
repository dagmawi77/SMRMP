const { Op, fn, col, literal } = require('sequelize');
const { MaintenanceRequest } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  serializeMaintenanceRequest,
  formatDateTime,
} = require('../utils/maintenanceSerializer');

const ASSIGNED_STATUSES = ['Assigned', 'In Progress', 'Waiting for Parts'];
const COMPLETED_STATUSES = ['Completed', 'Verified', 'Closed'];

const isAssignedToUser = (row, user) => {
  if (!user?.id) return false;
  const plain = row?.get ? row.get({ plain: true }) : row;
  if (plain.assigned_user_id) return plain.assigned_user_id === user.id;
  const assignedTo = plain.assigned_to || '';
  if (!assignedTo || assignedTo === 'Unassigned') return false;
  return assignedTo.toLowerCase().includes(String(user.name || '').toLowerCase());
};

const buildAssignedToMeWhere = (user) => ({
  [Op.or]: [
    { assigned_user_id: user.id },
    {
      assigned_user_id: null,
      assigned_to: {
        [Op.iLike]: `%${user.name}%`,
      },
    },
  ],
});

const buildStats = (rows) => {
  const requests = rows.map((row) => serializeMaintenanceRequest(row));

  return {
    total: requests.length,
    new: requests.filter((r) => r.status === 'New').length,
    pending_approval: requests.filter((r) => r.status === 'Pending Review').length,
    assigned: requests.filter((r) => ASSIGNED_STATUSES.includes(r.status)).length,
    in_progress: requests.filter(
      (r) => r.status === 'In Progress' || r.status === 'Waiting for Parts'
    ).length,
    completed: requests.filter((r) => COMPLETED_STATUSES.includes(r.status)).length,
    emergency: requests.filter((r) => r.isEmergency || r.priority === 'Critical').length,
    high_priority: requests.filter((r) => r.priority === 'High').length,
  };
};

const buildAnalytics = async () => {
  const monthlyRows = await MaintenanceRequest.findAll({
    attributes: [
      [fn('TO_CHAR', col('report_date'), 'Mon'), 'month'],
      [fn('EXTRACT', literal("MONTH FROM report_date")), 'month_num'],
      [fn('COUNT', col('id')), 'requests'],
      [
        fn(
          'SUM',
          literal(`CASE WHEN status IN ('Completed','Verified','Closed') THEN 1 ELSE 0 END`)
        ),
        'completed',
      ],
    ],
    where: {
      report_date: {
        [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
      },
    },
    group: [fn('TO_CHAR', col('report_date'), 'Mon'), fn('EXTRACT', literal('MONTH FROM report_date'))],
    order: [[fn('EXTRACT', literal('MONTH FROM report_date')), 'ASC']],
    raw: true,
  });

  const categoryRows = await MaintenanceRequest.findAll({
    attributes: ['category', [fn('COUNT', col('id')), 'count']],
    group: ['category'],
    order: [[fn('COUNT', col('id')), 'DESC']],
    raw: true,
  });

  return {
    monthly_requests: monthlyRows.map((row) => ({
      month: row.month,
      requests: Number(row.requests) || 0,
      completed: Number(row.completed) || 0,
    })),
    category_breakdown: categoryRows.map((row) => ({
      category: row.category,
      count: Number(row.count) || 0,
    })),
  };
};

const getDashboard = async (req, res) => {
  try {
    const rows = await MaintenanceRequest.findAll({
      order: [['report_date', 'DESC']],
    });

    const requests = rows.map((row) => serializeMaintenanceRequest(row));
    const stats = buildStats(rows);
    const analytics = await buildAnalytics();
    const assignedRows = rows.filter((row) => ASSIGNED_STATUSES.includes(row.status));
    const myAssignedRows =
      req.user?.role === 'maintenance'
        ? assignedRows.filter((row) => isAssignedToUser(row, req.user))
        : assignedRows;

    return sendSuccess(res, 200, 'Maintenance dashboard retrieved', {
      stats,
      recent_requests: requests.slice(0, 4),
      assigned_tasks: myAssignedRows.map((row) => serializeMaintenanceRequest(row)),
      analytics,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load maintenance dashboard', error.message);
  }
};

const getRequests = async (req, res) => {
  try {
    const { assigned_only, mine, status, limit = 100 } = req.query;
    const where = {};

    if (mine === 'true') {
      where.status = { [Op.in]: ASSIGNED_STATUSES };
      Object.assign(where, buildAssignedToMeWhere(req.user));
    } else if (assigned_only === 'true') {
      where.status = { [Op.in]: ASSIGNED_STATUSES };
    } else if (status) {
      const statuses = String(status)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (statuses.length) where.status = { [Op.in]: statuses };
    }

    const rows = await MaintenanceRequest.findAll({
      where,
      order: [['report_date', 'DESC']],
      limit: Math.min(parseInt(limit, 10) || 100, 200),
    });

    return sendSuccess(res, 200, 'Maintenance requests retrieved', {
      requests: rows.map((row) => serializeMaintenanceRequest(row)),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve maintenance requests', error.message);
  }
};

const getRequestByCode = async (req, res) => {
  try {
    const row = await MaintenanceRequest.findOne({
      where: { request_code: req.params.code },
    });

    if (!row) return sendError(res, 404, 'Maintenance request not found');

    return sendSuccess(res, 200, 'Maintenance request retrieved', {
      request: serializeMaintenanceRequest(row),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve maintenance request', error.message);
  }
};

const closeRequest = async (req, res) => {
  try {
    const row = await MaintenanceRequest.findOne({
      where: { request_code: req.params.code },
    });

    if (!row) return sendError(res, 404, 'Maintenance request not found');

    if (req.user?.role === 'maintenance' && !isAssignedToUser(row, req.user)) {
      return sendError(res, 403, 'You can only close tasks assigned to you');
    }

    const closeNotes = req.body?.close_notes || req.body?.closeNotes || '';
    const userName = req.user?.name || 'Maintenance Officer';
    const now = new Date();
    const timeline = Array.isArray(row.timeline) ? [...row.timeline] : [];

    timeline.push({
      date: formatDateTime(now),
      action: 'Request Closed & Verified',
      user: userName,
      note: closeNotes || 'Verification inspection completed. Request officially closed.',
    });

    await row.update({
      status: 'Closed',
      timeline,
    });
    await row.reload();

    return sendSuccess(res, 200, 'Maintenance request closed', {
      request: serializeMaintenanceRequest(row),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to close maintenance request', error.message);
  }
};

module.exports = {
  getDashboard,
  getRequests,
  getRequestByCode,
  closeRequest,
};

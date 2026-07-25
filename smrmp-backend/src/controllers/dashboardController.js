const { Op, fn, col } = require('sequelize');
const { Artifact, Exhibition, Ticket } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { startOfDay, startOfMonth, daysAgo } = require('../utils/dateHelpers');

const getStats = async (req, res) => {
  try {
    const today = startOfDay();

    const [
      totalArtifacts,
      activeExhibitions,
      conservationAlerts,
      visitorsToday,
      ticketsSoldMonth,
      recentArtifacts,
    ] = await Promise.all([
      Artifact.count(),
      Exhibition.count({ where: { status: 'active' } }),
      Artifact.count({
        where: { condition_status: { [Op.in]: ['poor', 'critical'] } },
      }),
      Ticket.count({
        where: {
          created_at: { [Op.gte]: today },
          payment_status: 'completed',
        },
      }),
      Ticket.count({
        where: {
          created_at: { [Op.gte]: startOfMonth() },
          payment_status: 'completed',
        },
      }),
      Artifact.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'category', 'condition_status', 'created_at'],
      }),
    ]);

    return sendSuccess(res, 200, 'Dashboard stats retrieved', {
      stats: {
        total_artifacts: totalArtifacts,
        active_exhibitions: activeExhibitions,
        conservation_alerts: conservationAlerts,
        visitors_today: visitorsToday,
        tickets_sold_this_month: ticketsSoldMonth,
      },
      recent_artifacts: recentArtifacts,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load dashboard', error.message);
  }
};

const getChartData = async (req, res) => {
  try {
    const categoryData = await Artifact.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    const conservationData = await Artifact.findAll({
      attributes: ['condition_status', [fn('COUNT', col('id')), 'count']],
      group: ['condition_status'],
      raw: true,
    });

    const visitorTrend = await Ticket.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        created_at: { [Op.gte]: daysAgo(30) },
        payment_status: 'completed',
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });

    return sendSuccess(res, 200, 'Chart data retrieved', {
      categories: categoryData,
      conservation_status: conservationData,
      visitor_trend: visitorTrend,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to load chart data', error.message);
  }
};

module.exports = { getStats, getChartData };

const { Op } = require('sequelize');
const {
  Artifact,
  Exhibition,
  ConservationLog,
  Ticket,
} = require('../models');
const { startOfMonth } = require('../utils/dateHelpers');

/**
 * Aggregate museum metrics used by AI report generation.
 */
const aggregateReportData = async (reportType) => {
  const [artifacts, exhibitions, conservationLogs, tickets] = await Promise.all([
    Artifact.findAll({
      attributes: ['category', 'condition_status', 'created_at'],
    }),
    Exhibition.findAll({
      attributes: ['name', 'status', 'start_date', 'end_date'],
    }),
    ConservationLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
    }),
    Ticket.findAll({
      where: { created_at: { [Op.gte]: startOfMonth() } },
      attributes: ['ticket_type', 'total_amount', 'payment_status'],
    }),
  ]);

  return {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    period: `${new Date().toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })}`,
    summary: {
      total_artifacts: artifacts.length,
      artifacts_by_condition: artifacts.reduce((acc, a) => {
        acc[a.condition_status] = (acc[a.condition_status] || 0) + 1;
        return acc;
      }, {}),
      active_exhibitions: exhibitions.filter((e) => e.status === 'active').length,
      tickets_sold: tickets.filter((t) => t.payment_status === 'completed').length,
      revenue_etb: tickets
        .filter((t) => t.payment_status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.total_amount, 10), 0),
    },
  };
};

module.exports = { aggregateReportData };

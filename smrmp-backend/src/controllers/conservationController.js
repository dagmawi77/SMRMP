const { body } = require('express-validator');
const { ConservationLog, Artifact, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'critical'];

const createValidation = [
  body('artifact_id').isUUID(),
  body('condition_before').optional().isIn(CONDITIONS),
  body('condition_after').optional().isIn(CONDITIONS),
  body('observations').optional().isString(),
  body('action_taken').optional().isString(),
  body('requires_restoration').optional().isBoolean(),
  validateRequest,
];

const getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, artifact_id } = req.query;
    const where = {};
    if (artifact_id) where.artifact_id = artifact_id;

    const { count, rows } = await ConservationLog.findAndCountAll({
      where,
      include: [
        {
          model: Artifact,
          as: 'artifact',
          attributes: ['id', 'name', 'condition_status', 'qr_code'],
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'name', 'role'],
        },
      ],
      order: [['inspected_at', 'DESC']],
      ...paginate(page, limit),
    });

    return sendSuccess(res, 200, 'Conservation logs retrieved', {
      conservation_logs: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        totalPages: Math.ceil(count / (parseInt(limit, 10) || 20)),
      },
    });
  } catch (error) {
    return sendError(
      res,
      500,
      'Failed to retrieve conservation logs',
      error.message
    );
  }
};

const getLogById = async (req, res) => {
  try {
    const log = await ConservationLog.findByPk(req.params.id, {
      include: [
        { model: Artifact, as: 'artifact' },
        { model: User, as: 'inspector', attributes: ['id', 'name', 'role'] },
      ],
    });

    if (!log) return sendError(res, 404, 'Conservation log not found');

    return sendSuccess(res, 200, 'Conservation log retrieved', {
      conservation_log: log,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      'Failed to retrieve conservation log',
      error.message
    );
  }
};

const createLog = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.body.artifact_id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    const log = await ConservationLog.create({
      artifact_id: req.body.artifact_id,
      inspector_id: req.user.id,
      condition_before: req.body.condition_before || artifact.condition_status,
      condition_after: req.body.condition_after,
      observations: req.body.observations,
      action_taken: req.body.action_taken,
      next_inspection_date: req.body.next_inspection_date,
      requires_restoration: req.body.requires_restoration || false,
      inspected_at: req.body.inspected_at || new Date(),
    });

    if (req.body.condition_after) {
      await artifact.update({
        condition_status: req.body.condition_after,
        last_edited_by: req.user.id,
      });
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'CREATE_CONSERVATION_LOG',
      tableName: 'conservation_logs',
      recordId: log.id,
      newValues: {
        artifact_id: log.artifact_id,
        condition_after: log.condition_after,
      },
      ipAddress: req.ip,
    });

    const full = await ConservationLog.findByPk(log.id, {
      include: [
        { model: Artifact, as: 'artifact' },
        { model: User, as: 'inspector', attributes: ['id', 'name', 'role'] },
      ],
    });

    return sendSuccess(res, 201, 'Conservation log created', {
      conservation_log: full,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      'Failed to create conservation log',
      error.message
    );
  }
};

const updateLog = async (req, res) => {
  try {
    const log = await ConservationLog.findByPk(req.params.id);
    if (!log) return sendError(res, 404, 'Conservation log not found');

    await log.update(req.body);

    if (req.body.condition_after) {
      await Artifact.update(
        {
          condition_status: req.body.condition_after,
          last_edited_by: req.user.id,
        },
        { where: { id: log.artifact_id } }
      );
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE_CONSERVATION_LOG',
      tableName: 'conservation_logs',
      recordId: log.id,
      newValues: req.body,
      ipAddress: req.ip,
    });

    const full = await ConservationLog.findByPk(log.id, {
      include: [
        { model: Artifact, as: 'artifact' },
        { model: User, as: 'inspector', attributes: ['id', 'name', 'role'] },
      ],
    });

    return sendSuccess(res, 200, 'Conservation log updated', {
      conservation_log: full,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      'Failed to update conservation log',
      error.message
    );
  }
};

const deleteLog = async (req, res) => {
  try {
    const log = await ConservationLog.findByPk(req.params.id);
    if (!log) return sendError(res, 404, 'Conservation log not found');

    await log.destroy();

    await writeAuditLog({
      userId: req.user.id,
      action: 'DELETE_CONSERVATION_LOG',
      tableName: 'conservation_logs',
      recordId: log.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Conservation log deleted');
  } catch (error) {
    return sendError(
      res,
      500,
      'Failed to delete conservation log',
      error.message
    );
  }
};

module.exports = {
  getAllLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  createValidation,
};

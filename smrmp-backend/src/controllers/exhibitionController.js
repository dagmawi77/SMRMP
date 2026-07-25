const { body } = require('express-validator');
const { Exhibition, Artifact, ExhibitionArtifact } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

const STATUSES = ['draft', 'upcoming', 'active', 'ended'];

const createValidation = [
  body('name').trim().notEmpty(),
  body('status').optional().isIn(STATUSES),
  body('artifact_ids').optional().isArray(),
  validateRequest,
];

const getAllExhibitions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Exhibition.findAndCountAll({
      where,
      include: [
        {
          model: Artifact,
          as: 'artifacts',
          attributes: ['id', 'name', 'category', 'qr_code'],
          through: { attributes: ['display_order'] },
        },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
      distinct: true,
    });

    return sendSuccess(res, 200, 'Exhibitions retrieved', {
      exhibitions: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        totalPages: Math.ceil(count / (parseInt(limit, 10) || 20)),
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve exhibitions', error.message);
  }
};

const getExhibitionById = async (req, res) => {
  try {
    const exhibition = await Exhibition.findByPk(req.params.id, {
      include: [
        {
          model: Artifact,
          as: 'artifacts',
          through: { attributes: ['display_order'] },
        },
      ],
    });

    if (!exhibition) return sendError(res, 404, 'Exhibition not found');

    return sendSuccess(res, 200, 'Exhibition retrieved', { exhibition });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve exhibition', error.message);
  }
};

const createExhibition = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      start_date,
      end_date,
      location,
      artifact_ids = [],
    } = req.body;

    const exhibition = await Exhibition.create({
      name,
      description,
      status: status || 'draft',
      start_date,
      end_date,
      location,
      created_by: req.user.id,
    });

    if (artifact_ids.length) {
      await ExhibitionArtifact.bulkCreate(
        artifact_ids.map((artifactId, index) => ({
          exhibition_id: exhibition.id,
          artifact_id: artifactId,
          display_order: index,
        }))
      );
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'CREATE_EXHIBITION',
      tableName: 'exhibitions',
      recordId: exhibition.id,
      newValues: { name, status: exhibition.status },
      ipAddress: req.ip,
    });

    const full = await Exhibition.findByPk(exhibition.id, {
      include: [{ model: Artifact, as: 'artifacts' }],
    });

    return sendSuccess(res, 201, 'Exhibition created', { exhibition: full });
  } catch (error) {
    return sendError(res, 500, 'Failed to create exhibition', error.message);
  }
};

const updateExhibition = async (req, res) => {
  try {
    const exhibition = await Exhibition.findByPk(req.params.id);
    if (!exhibition) return sendError(res, 404, 'Exhibition not found');

    const { artifact_ids, ...fields } = req.body;
    await exhibition.update(fields);

    if (Array.isArray(artifact_ids)) {
      await ExhibitionArtifact.destroy({
        where: { exhibition_id: exhibition.id },
      });
      if (artifact_ids.length) {
        await ExhibitionArtifact.bulkCreate(
          artifact_ids.map((artifactId, index) => ({
            exhibition_id: exhibition.id,
            artifact_id: artifactId,
            display_order: index,
          }))
        );
      }
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE_EXHIBITION',
      tableName: 'exhibitions',
      recordId: exhibition.id,
      newValues: req.body,
      ipAddress: req.ip,
    });

    const full = await Exhibition.findByPk(exhibition.id, {
      include: [{ model: Artifact, as: 'artifacts' }],
    });

    return sendSuccess(res, 200, 'Exhibition updated', { exhibition: full });
  } catch (error) {
    return sendError(res, 500, 'Failed to update exhibition', error.message);
  }
};

const deleteExhibition = async (req, res) => {
  try {
    const exhibition = await Exhibition.findByPk(req.params.id);
    if (!exhibition) return sendError(res, 404, 'Exhibition not found');

    await exhibition.destroy();

    await writeAuditLog({
      userId: req.user.id,
      action: 'DELETE_EXHIBITION',
      tableName: 'exhibitions',
      recordId: exhibition.id,
      oldValues: { name: exhibition.name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Exhibition deleted');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete exhibition', error.message);
  }
};

module.exports = {
  getAllExhibitions,
  getExhibitionById,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  createValidation,
};

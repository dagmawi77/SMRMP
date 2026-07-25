const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Artifact, ArtifactImage, User } = require('../models');
const { generateArtifactQR } = require('../services/qrService');
const { uploadArtifactImages } = require('../services/imageService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

const ARTIFACT_CATEGORIES = [
  'weapon',
  'textile',
  'document',
  'ceramic',
  'jewelry',
  'ceremonial',
  'photograph',
  'coin',
  'other',
];

const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'critical'];

const createValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('category').isIn(ARTIFACT_CATEGORIES),
  body('location').trim().notEmpty().withMessage('location is required'),
  body('condition_status').optional().isIn(CONDITIONS),
  validateRequest,
];

const parseKeywords = (keywords) => {
  if (!keywords) return [];
  if (Array.isArray(keywords)) return keywords;
  try {
    const parsed = JSON.parse(keywords);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return String(keywords)
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }
};

const getAllArtifacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      condition_status,
      location,
      period,
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { origin: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { historical_period: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category) where.category = category;
    if (condition_status) where.condition_status = condition_status;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (period) where.historical_period = { [Op.iLike]: `%${period}%` };

    const { count, rows } = await Artifact.findAndCountAll({
      where,
      include: [
        {
          model: ArtifactImage,
          as: 'images',
          where: { is_primary: true },
          required: false,
          attributes: ['file_path', 'file_url'],
        },
      ],
      order: [['created_at', 'DESC']],
      ...paginate(page, limit),
      distinct: true,
    });

    return sendSuccess(res, 200, 'Artifacts retrieved', {
      artifacts: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        totalPages: Math.ceil(count / (parseInt(limit, 10) || 20)),
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve artifacts', error.message);
  }
};

const getArtifactById = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.params.id, {
      include: [
        { model: ArtifactImage, as: 'images' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
      ],
    });

    if (!artifact) return sendError(res, 404, 'Artifact not found');

    let qrDataUrl = null;
    if (artifact.qr_code) {
      try {
        const qrRes = await generateArtifactQR(artifact.qr_code);
        qrDataUrl = qrRes.qrDataUrl;
      } catch (_e) {
        // Fallback if QR generation fails
      }
    }

    return sendSuccess(res, 200, 'Artifact retrieved', { artifact, qr_data_url: qrDataUrl });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve artifact', error.message);
  }
};

const getArtifactByQR = async (req, res) => {
  try {
    const artifact = await Artifact.findOne({
      where: { qr_code: req.params.code },
      include: [{ model: ArtifactImage, as: 'images' }],
      attributes: {
        exclude: ['created_by', 'last_edited_by', 'ai_description', 'deleted_at'],
      },
    });

    if (!artifact) {
      return sendError(
        res,
        404,
        'Artifact not found. This QR code may be invalid.'
      );
    }

    let qrDataUrl = null;
    if (artifact.qr_code) {
      try {
        const qrRes = await generateArtifactQR(artifact.qr_code);
        qrDataUrl = qrRes.qrDataUrl;
      } catch (_e) {
        // Fallback if QR generation fails
      }
    }

    return sendSuccess(res, 200, 'Artifact retrieved', { artifact, qr_data_url: qrDataUrl });
  } catch (error) {
    return sendError(res, 500, 'QR lookup failed', error.message);
  }
};

const createArtifact = async (req, res) => {
  try {
    const {
      name,
      category,
      historical_period,
      origin,
      materials,
      description,
      amharic_description,
      staff_notes,
      video_url,
      location,
      condition_status,
      keywords,
    } = req.body;

    const { qrCode, qrDataUrl } = await generateArtifactQR();

    const artifact = await Artifact.create({
      name,
      category,
      historical_period,
      origin,
      materials,
      description,
      amharic_description,
      staff_notes,
      video_url: video_url ? video_url.trim() : null,
      location,
      condition_status: condition_status || 'good',
      qr_code: qrCode,
      keywords: parseKeywords(keywords),
      created_by: req.user.id,
    });

    if (req.files && req.files.length > 0) {
      const uploaded = await uploadArtifactImages(req.files);
      await ArtifactImage.bulkCreate(
        uploaded.map((img, index) => ({
          artifact_id: artifact.id,
          file_path: img.file_path,
          file_url: img.file_url,
          is_primary: index === 0,
        }))
      );
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'CREATE_ARTIFACT',
      tableName: 'artifacts',
      recordId: artifact.id,
      newValues: { name, category },
      ipAddress: req.ip,
    });

    const fullArtifact = await Artifact.findByPk(artifact.id, {
      include: [{ model: ArtifactImage, as: 'images' }],
    });

    return sendSuccess(res, 201, 'Artifact created successfully', {
      artifact: fullArtifact,
      qr_data_url: qrDataUrl,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to create artifact', error.message);
  }
};

const updateArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.params.id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    const oldValues = artifact.toJSON();
    const updates = { ...req.body, last_edited_by: req.user.id };
    if (updates.keywords !== undefined) {
      updates.keywords = parseKeywords(updates.keywords);
    }
    delete updates.id;
    delete updates.qr_code;
    delete updates.created_by;

    await artifact.update(updates);

    if (req.files && req.files.length > 0) {
      const uploaded = await uploadArtifactImages(req.files);
      const existingImagesCount = await ArtifactImage.count({ where: { artifact_id: artifact.id } });
      await ArtifactImage.bulkCreate(
        uploaded.map((img, index) => ({
          artifact_id: artifact.id,
          file_path: img.file_path,
          file_url: img.file_url,
          is_primary: existingImagesCount === 0 && index === 0,
        }))
      );
    }

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE_ARTIFACT',
      tableName: 'artifacts',
      recordId: artifact.id,
      oldValues,
      newValues: req.body,
      ipAddress: req.ip,
    });

    const updated = await Artifact.findByPk(artifact.id, {
      include: [{ model: ArtifactImage, as: 'images' }],
    });

    return sendSuccess(res, 200, 'Artifact updated', { artifact: updated });
  } catch (error) {
    return sendError(res, 500, 'Failed to update artifact', error.message);
  }
};

const deleteArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.findByPk(req.params.id);
    if (!artifact) return sendError(res, 404, 'Artifact not found');

    await artifact.destroy();

    await writeAuditLog({
      userId: req.user.id,
      action: 'DELETE_ARTIFACT',
      tableName: 'artifacts',
      recordId: artifact.id,
      oldValues: { name: artifact.name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Artifact removed from active catalog');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete artifact', error.message);
  }
};

module.exports = {
  getAllArtifacts,
  getArtifactById,
  getArtifactByQR,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  createValidation,
};

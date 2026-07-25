const { Op } = require('sequelize');
const {
  generateArtifactDescription,
  interpretSearchQuery,
  answerMuseumQuestion,
  generateReport,
} = require('../services/aiService');
const { Artifact, ArtifactImage } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const describeArtifact = async (req, res) => {
  try {
    const {
      name,
      category,
      historical_period,
      origin,
      materials,
      staff_notes,
    } = req.body;

    if (!name || !category) {
      return sendError(
        res,
        400,
        'Artifact name and category are required for AI description'
      );
    }

    const result = await generateArtifactDescription({
      name,
      category,
      historical_period,
      origin,
      materials,
      staff_notes,
    });

    return sendSuccess(res, 200, 'AI description generated', result);
  } catch (error) {
    if (error.message.includes('quota')) {
      return sendError(
        res,
        429,
        'AI quota exceeded. Please contact your administrator.'
      );
    }
    return sendError(
      res,
      503,
      'AI description service unavailable. Please write the description manually.',
      error.message
    );
  }
};

const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return sendError(res, 400, 'Search query too short');
    }

    const interpreted = await interpretSearchQuery(query);
    const { filters } = interpreted;
    const where = {};

    if (filters.name) where.name = { [Op.iLike]: `%${filters.name}%` };
    if (filters.category) where.category = filters.category;
    if (filters.condition_status) {
      where.condition_status = filters.condition_status;
    }
    if (filters.historical_period) {
      where.historical_period = {
        [Op.iLike]: `%${filters.historical_period}%`,
      };
    }
    if (filters.origin) {
      where.origin = { [Op.iLike]: `%${filters.origin}%` };
    }
    if (filters.location) {
      where.location = { [Op.iLike]: `%${filters.location}%` };
    }
    if (filters.needs_conservation === true) {
      where.condition_status = { [Op.in]: ['poor', 'critical'] };
    }

    const artifacts = await Artifact.findAll({
      where,
      include: [
        {
          model: ArtifactImage,
          as: 'images',
          where: { is_primary: true },
          required: false,
        },
      ],
      limit: 50,
      order: [['created_at', 'DESC']],
    });

    return sendSuccess(res, 200, 'Smart search complete', {
      query,
      interpretation: interpreted.interpretation,
      filters: interpreted.filters,
      count: artifacts.length,
      artifacts,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      'Smart search failed. Use standard search.',
      error.message
    );
  }
};

const generateReportHandler = async (req, res) => {
  try {
    const { report_type } = req.body;
    const validTypes = [
      'daily_operations',
      'monthly_summary',
      'conservation_status',
      'visitor_analytics',
      'executive_overview',
    ];

    if (!validTypes.includes(report_type)) {
      return sendError(
        res,
        400,
        `Invalid report type. Valid types: ${validTypes.join(', ')}`
      );
    }

    const result = await generateReport(report_type);
    return sendSuccess(res, 200, 'Report generated', result);
  } catch (error) {
    return sendError(
      res,
      503,
      'Report generation failed. Data may be insufficient for this report type.',
      error.message
    );
  }
};

const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return sendError(res, 400, 'Please provide a valid question');
    }

    const blockedTopics = ['personal', 'confidential', 'salary', 'password'];
    const lower = question.toLowerCase();
    if (blockedTopics.some((t) => lower.includes(t))) {
      return sendError(
        res,
        400,
        'That question is outside the scope of this assistant.'
      );
    }

    const result = await answerMuseumQuestion(question);
    return sendSuccess(res, 200, 'Answer generated', result);
  } catch (error) {
    return sendError(
      res,
      503,
      'AI assistant is temporarily unavailable.',
      error.message
    );
  }
};

module.exports = {
  describeArtifact,
  smartSearch,
  generateReport: generateReportHandler,
  askAssistant,
};

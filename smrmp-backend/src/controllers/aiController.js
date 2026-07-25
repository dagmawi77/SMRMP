const { Op } = require('sequelize');
const {
  generateArtifactDescription,
  interpretSearchQuery,
  answerMuseumQuestion,
  generateReport,
} = require('../services/aiService');
const { Artifact, ArtifactImage } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { logTokenUsage } = require('../utils/tokenLogger');

// POST /api/ai/describe-artifact — Section 4 + Section 5
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

    logTokenUsage({
      endpoint: '/ai/describe-artifact',
      model: result.model_used,
      tokensUsed: result.tokens_used,
      userId: req.user?.id,
    });

    // Section 4 contract (no nested service "success" flag)
    return sendSuccess(res, 200, 'AI description generated', {
      description: {
        ...result.description,
        curator_review_required: true,
      },
      ai_label: result.ai_label,
      model_used: result.model_used,
      tokens_used: result.tokens_used,
    });
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

// POST /api/ai/search
const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return sendError(res, 400, 'Search query too short');
    }

    const interpreted = await interpretSearchQuery(query);
    const { filters = {} } = interpreted;
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

    // Section 4: filters, interpretation, artifacts
    return sendSuccess(res, 200, 'Smart search complete', {
      filters: interpreted.filters,
      interpretation: interpreted.interpretation,
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

// POST /api/ai/generate-report — Auth: Admin, Curator (Curator+)
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

    logTokenUsage({
      endpoint: '/ai/generate-report',
      tokensUsed: result.tokens_used,
      userId: req.user?.id,
    });

    return sendSuccess(res, 200, 'Report generated', {
      report: {
        title: result.report.title,
        generated_at: result.report.generated_at,
        content: result.report.content,
        sections: result.report.sections,
      },
      ai_label: result.ai_label,
    });
  } catch (error) {
    return sendError(
      res,
      503,
      'Report generation failed. Data may be insufficient for this report type.',
      error.message
    );
  }
};

// POST /api/ai/ask
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

    logTokenUsage({
      endpoint: '/ai/ask',
      tokensUsed: result.tokens_used,
      userId: req.user?.id,
    });

    return sendSuccess(res, 200, 'Answer generated', {
      answer: result.answer,
      data_sources: result.data_sources,
      timestamp: result.timestamp,
    });
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

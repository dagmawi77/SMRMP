/**
 * Module 8 — Visitor feedback collection, moderation, and AI sentiment analysis.
 */
const { Op, fn, col } = require('sequelize');
const { VisitorFeedback, Visitor, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const { writeAuditLog } = require('../middleware/auditLogger');

const toCount = (value) => Number(value) || 0;

let openaiClient = null;
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    // eslint-disable-next-line global-require
    const OpenAI = require('openai');
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL =
      process.env.OPENAI_BASE_URL ||
      (apiKey.startsWith('sk-or-') ? 'https://openrouter.ai/api/v1' : undefined);
    const clientOptions = { apiKey };
    if (baseURL) clientOptions.baseURL = baseURL;
    openaiClient = new OpenAI(clientOptions);
  }
  return openaiClient;
};

const AI_MODEL = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

/**
 * Fire-and-forget sentiment analysis. Never throws — failures are logged
 * only, so feedback submission is never blocked by AI availability.
 */
const analyzeAndUpdateFeedback = async (feedbackId, comment) => {
  try {
    if (!comment || !String(comment).trim()) return;
    const client = getOpenAI();
    if (!client) return;

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You analyze museum visitor feedback. Output valid JSON only: ' +
            '{"sentiment": "positive|neutral|negative", "sentiment_score": number between -1 and 1, ' +
            '"summary": "one sentence summary", "tags": ["tag1", "tag2"]}',
        },
        { role: 'user', content: `Visitor comment: "${comment}"` },
      ],
      max_tokens: 200,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    await VisitorFeedback.update(
      {
        sentiment: parsed.sentiment || null,
        sentiment_score: parsed.sentiment_score !== undefined ? Number(parsed.sentiment_score) : null,
        ai_summary: parsed.summary || null,
        ai_tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      },
      { where: { id: feedbackId } }
    );
  } catch (error) {
    console.error('[FEEDBACK-AI] Sentiment analysis failed silently:', error.message);
  }
};

/** POST /api/feedback — public submission */
const submitFeedback = async (req, res) => {
  try {
    // Accept PRD `overall_rating` as alias for `rating`
    const rating = req.body.rating ?? req.body.overall_rating;
    const ratingNum = parseInt(rating, 10);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return sendError(res, 400, 'rating is required and must be between 1 and 5');
    }

    const highlight = req.body.highlight || null;
    const improvement = req.body.improvement || null;
    const comment =
      req.body.comment ||
      [highlight && `Highlight: ${highlight}`, improvement && `Improvement: ${improvement}`]
        .filter(Boolean)
        .join('\n') ||
      null;

    const feedback = await VisitorFeedback.create({
      visitor_id: req.body.visitor_id || null,
      visit_log_id: req.body.visit_log_id || null,
      visitor_name: req.body.visitor_name || null,
      visitor_email: req.body.visitor_email || null,
      rating: ratingNum,
      category: req.body.category || 'overall',
      comment,
      status: 'new',
    });

    // Fire-and-forget — do not block the response on AI availability.
    analyzeAndUpdateFeedback(feedback.id, feedback.comment).catch(() => {});

    return sendSuccess(res, 201, 'Feedback submitted successfully', { feedback });
  } catch (error) {
    return sendError(res, 500, 'Failed to submit feedback', error.message);
  }
};

/** GET /api/feedback */
const listFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, rating, is_public } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (rating) where.rating = parseInt(rating, 10);
    if (is_public !== undefined) where.is_public = is_public === 'true';

    const paging = paginate(page, limit);
    const { count, rows } = await VisitorFeedback.findAndCountAll({
      where,
      include: [{ model: Visitor, attributes: ['id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']],
      ...paging,
    });

    return sendSuccess(res, 200, 'Feedback retrieved', {
      feedback: rows,
      pagination: {
        total: count,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve feedback', error.message);
  }
};

/** GET /api/feedback/public */
const getPublicFeedback = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const feedback = await VisitorFeedback.findAll({
      where: { is_public: true },
      attributes: ['id', 'rating', 'category', 'comment', 'visitor_name', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
    });
    return sendSuccess(res, 200, 'Public feedback retrieved', { feedback });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve public feedback', error.message);
  }
};

/** GET /api/feedback/analytics */
const getFeedbackAnalytics = async (req, res) => {
  try {
    const [summaryRow] = await VisitorFeedback.findAll({
      attributes: [[fn('AVG', col('rating')), 'avg_rating'], [fn('COUNT', col('id')), 'total']],
      raw: true,
    });

    const byRating = await VisitorFeedback.findAll({
      attributes: ['rating', [fn('COUNT', col('id')), 'count']],
      group: ['rating'],
      order: [['rating', 'ASC']],
      raw: true,
    });

    const byCategory = await VisitorFeedback.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    const bySentiment = await VisitorFeedback.findAll({
      attributes: ['sentiment', [fn('COUNT', col('id')), 'count']],
      where: { sentiment: { [Op.ne]: null } },
      group: ['sentiment'],
      raw: true,
    });

    const byStatus = await VisitorFeedback.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    return sendSuccess(res, 200, 'Feedback analytics retrieved', {
      average_rating: summaryRow?.avg_rating ? Number(summaryRow.avg_rating).toFixed(2) : null,
      total_feedback: toCount(summaryRow?.total),
      by_rating: byRating.map((row) => ({ rating: row.rating, count: toCount(row.count) })),
      by_category: byCategory.map((row) => ({ category: row.category, count: toCount(row.count) })),
      by_sentiment: bySentiment.map((row) => ({ sentiment: row.sentiment, count: toCount(row.count) })),
      by_status: byStatus.map((row) => ({ status: row.status, count: toCount(row.count) })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve feedback analytics', error.message);
  }
};

/** GET /api/feedback/:id */
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await VisitorFeedback.findByPk(req.params.id, {
      include: [
        { model: Visitor, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'responder', attributes: ['id', 'name'] },
      ],
    });
    if (!feedback) {
      return sendError(res, 404, 'Feedback not found');
    }
    return sendSuccess(res, 200, 'Feedback retrieved', { feedback });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve feedback', error.message);
  }
};

/** PUT /api/feedback/:id */
const updateFeedback = async (req, res) => {
  try {
    const feedback = await VisitorFeedback.findByPk(req.params.id);
    if (!feedback) {
      return sendError(res, 404, 'Feedback not found');
    }

    const oldValues = feedback.get({ plain: true });
    const fields = ['status', 'category', 'is_public', 'comment', 'rating'];
    const payload = {};
    for (const field of fields) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    await feedback.update(payload);

    await writeAuditLog({
      userId: req.user?.id,
      action: 'UPDATE',
      tableName: 'visitor_feedback',
      recordId: feedback.id,
      oldValues,
      newValues: payload,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Feedback updated successfully', { feedback });
  } catch (error) {
    return sendError(res, 500, 'Failed to update feedback', error.message);
  }
};

/** POST /api/feedback/:id/respond */
const respondToFeedback = async (req, res) => {
  try {
    const feedback = await VisitorFeedback.findByPk(req.params.id);
    if (!feedback) {
      return sendError(res, 404, 'Feedback not found');
    }
    // Accept PRD alias `staff_response`
    const response_text = req.body.response_text || req.body.staff_response;
    if (!response_text || !String(response_text).trim()) {
      return sendError(res, 400, 'response_text is required');
    }

    await feedback.update({
      response_text: String(response_text).trim(),
      responded_by: req.user?.id || null,
      responded_at: new Date(),
      status: 'responded',
    });

    return sendSuccess(res, 200, 'Response recorded successfully', { feedback });
  } catch (error) {
    return sendError(res, 500, 'Failed to respond to feedback', error.message);
  }
};

/** POST /api/feedback/:id/publish */
const publishFeedback = async (req, res) => {
  try {
    const feedback = await VisitorFeedback.findByPk(req.params.id);
    if (!feedback) {
      return sendError(res, 404, 'Feedback not found');
    }

    const publish =
      req.body.is_public === undefined && req.body.is_published === undefined
        ? true
        : Boolean(req.body.is_public ?? req.body.is_published);

    if (publish && feedback.rating < 4) {
      return sendError(res, 400, 'Only feedback rated 4 or 5 can be published');
    }

    await feedback.update({
      is_public: publish,
      status: publish ? 'published' : feedback.status === 'published' ? 'reviewed' : feedback.status,
    });

    return sendSuccess(res, 200, publish ? 'Feedback published successfully' : 'Feedback unpublished', {
      feedback,
      is_published: publish,
      feedback_id: feedback.id,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to publish feedback', error.message);
  }
};

module.exports = {
  submitFeedback,
  listFeedback,
  getFeedbackById,
  updateFeedback,
  getFeedbackAnalytics,
  getPublicFeedback,
  respondToFeedback,
  publishFeedback,
  analyzeAndUpdateFeedback,
};

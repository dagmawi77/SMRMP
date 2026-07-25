const { Op } = require('sequelize');
const {
  Exhibition,
  Artifact,
  Ticket,
  TicketType,
  VisitorFeedback,
} = require('../models');
const { answerVisitorQuestion } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { logTokenUsage } = require('../utils/tokenLogger');

const DEFAULT_MUSEUM_INFO = {
  name: 'Adwa Victory Memorial Museum',
  city: 'Addis Ababa, Ethiopia',
  hours: {
    weekdays: 'Tue–Fri 09:00–17:00',
    weekend: 'Sat–Sun 10:00–18:00',
    closed: 'Mondays & public holidays',
  },
  address: 'Adwa Victory Memorial Museum, Addis Ababa',
  tips: [
    'Bring your digital ticket QR for entry',
    'Scan artifact QR codes with this Telegram bot or the museum website',
    'Photography rules may vary by gallery — follow posted signs',
  ],
};

/** GET /api/visitor/info */
const getMuseumInfo = async (_req, res) => {
  try {
    const info = {
      ...DEFAULT_MUSEUM_INFO,
      name: process.env.MUSEUM_NAME || DEFAULT_MUSEUM_INFO.name,
      website: process.env.FRONTEND_URL || null,
      tickets_url: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/tickets`
        : null,
      phone: process.env.MUSEUM_PHONE || null,
      telegram_bot: process.env.TELEGRAM_BOT_USERNAME || null,
    };
    return sendSuccess(res, 200, 'Museum info', { info });
  } catch (error) {
    return sendError(res, 500, 'Failed to load museum info', error.message);
  }
};

/** GET /api/visitor/exhibitions */
const getPublicExhibitions = async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const where = {};

    if (status === 'current') {
      where.status = { [Op.in]: ['active', 'planning'] };
    } else {
      where.status = status;
    }

    const exhibitions = await Exhibition.findAll({
      where,
      include: [
        {
          model: Artifact,
          as: 'artifacts',
          attributes: ['id', 'name', 'category', 'qr_code'],
          through: { attributes: ['display_order'] },
        },
      ],
      order: [['start_date', 'DESC']],
      limit: Math.min(parseInt(req.query.limit, 10) || 20, 50),
    });

    return sendSuccess(res, 200, 'Exhibitions retrieved', {
      exhibitions: exhibitions.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        theme: e.theme,
        gallery: e.gallery,
        start_date: e.start_date,
        end_date: e.end_date,
        status: e.status,
        artifacts: (e.artifacts || []).map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          qr_code: a.qr_code,
        })),
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve exhibitions', error.message);
  }
};

/** POST /api/visitor/ask */
const askVisitorGuide = async (req, res) => {
  try {
    const { question, language = 'en' } = req.body;

    if (!question || String(question).trim().length < 3) {
      return sendError(res, 400, 'Please provide a valid question');
    }

    const blocked = ['password', 'salary', 'confidential', 'admin login'];
    const lower = String(question).toLowerCase();
    if (blocked.some((t) => lower.includes(t))) {
      return sendError(res, 400, 'That question is outside the visitor guide scope.');
    }

    const lang = language === 'am' ? 'am' : 'en';
    const result = await answerVisitorQuestion(String(question).trim(), lang);

    logTokenUsage({
      endpoint: '/visitor/ask',
      tokensUsed: result.tokens_used,
      userId: null,
    });

    return sendSuccess(res, 200, 'Answer generated', {
      answer: result.answer,
      timestamp: result.timestamp,
    });
  } catch (error) {
    return sendError(
      res,
      503,
      'Visitor guide is temporarily unavailable.',
      error.message
    );
  }
};

/** POST /api/visitor/feedback — Telegram / public channel into Module 8 feedback */
const submitTelegramFeedback = async (req, res) => {
  try {
    const {
      rating,
      comment,
      telegram_username,
      visitor_name,
    } = req.body;

    const stars = parseInt(rating, 10);
    if (!stars || stars < 1 || stars > 5) {
      return sendError(res, 400, 'rating must be an integer from 1 to 5');
    }

    const name = visitor_name
      || (telegram_username ? String(telegram_username).slice(0, 255) : null);

    const row = await VisitorFeedback.create({
      rating: stars,
      comment: comment ? String(comment).trim().slice(0, 2000) : null,
      visitor_name: name,
      category: 'overall',
      status: 'new',
    });

    return sendSuccess(res, 201, 'Thank you for your feedback', {
      feedback: {
        id: row.id,
        rating: row.rating,
        created_at: row.created_at,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to save feedback', error.message);
  }
};

/** GET /api/visitor/tickets/:code — public ticket status by QR code */
const getTicketByCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) return sendError(res, 400, 'Ticket code is required');

    const ticket = await Ticket.findOne({ where: { qr_ticket_code: code } });
    if (!ticket) return sendError(res, 404, 'Ticket not found');

    let typeLabel = ticket.ticket_type;
    const catalog = await TicketType.findOne({ where: { type: ticket.ticket_type } });
    if (catalog) typeLabel = catalog.label;

    return sendSuccess(res, 200, 'Ticket found', {
      ticket: {
        qr_ticket_code: ticket.qr_ticket_code,
        ticket_type: ticket.ticket_type,
        ticket_label: typeLabel,
        quantity: ticket.quantity,
        visitor_name: ticket.visitor_name,
        visit_date: ticket.visit_date,
        status: ticket.status,
        payment_status: ticket.payment_status,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Ticket lookup failed', error.message);
  }
};

module.exports = {
  getMuseumInfo,
  getPublicExhibitions,
  askVisitorGuide,
  submitTelegramFeedback,
  getTicketByCode,
};

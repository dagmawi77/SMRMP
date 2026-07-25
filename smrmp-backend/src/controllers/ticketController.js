/**
 * BE-TKT-001 — Ticket controller: list, purchase, verify
 * APIs aligned with PRD Section 4 (+ staff list required by BE-TKT-001).
 */
const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Ticket, TicketType } = require('../models');
const { generateTicketQR } = require('../services/qrService');
const {
  simulatePayment,
  toPaymentSimulationResponse,
} = require('./paymentController');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');
const validateRequest = require('../middleware/validateRequest');

const formatDateOnly = (value) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const purchaseValidation = [
  body('ticket_type').trim().notEmpty().withMessage('ticket_type is required'),
  body('visitor_name').trim().notEmpty().withMessage('visitor_name is required'),
  body('visitor_phone').trim().notEmpty().withMessage('visitor_phone is required'),
  body('quantity').isInt({ min: 1, max: 50 }).withMessage('quantity must be 1–50'),
  body('payment_method')
    .isIn(['telebirr', 'chapa', 'cash'])
    .withMessage('payment_method must be telebirr, chapa, or cash'),
  body('visit_date').isISO8601().withMessage('visit_date must be a valid date'),
  validateRequest,
];

/** GET /api/tickets/types — Public catalog list */
const getTicketTypes = async (_req, res) => {
  try {
    const types = await TicketType.findAll({
      where: { is_active: true },
      order: [['price_etb', 'ASC']],
      attributes: ['type', 'label', 'price_etb', 'description'],
    });

    return sendSuccess(res, 200, 'Ticket types retrieved', {
      ticket_types: types.map((t) => ({
        type: t.type,
        label: t.label,
        price_etb: Number(t.price_etb),
        description: t.description,
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve ticket types', error.message);
  }
};

/**
 * GET /api/tickets — Staff list of purchased tickets (BE-TKT-001 "list")
 * Query: page, limit, status, ticket_type, visit_date, search
 */
const listTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      ticket_type,
      visit_date,
      search,
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (ticket_type) where.ticket_type = ticket_type;
    if (visit_date) where.visit_date = formatDateOnly(visit_date);
    if (search) {
      where[Op.or] = [
        { visitor_name: { [Op.iLike]: `%${search}%` } },
        { visitor_phone: { [Op.iLike]: `%${search}%` } },
        { qr_ticket_code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const paging = paginate(page, limit);

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      ...paging,
    });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    return sendSuccess(res, 200, 'Tickets retrieved', {
      tickets: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve tickets', error.message);
  }
};

/** POST /api/tickets/purchase — Public purchase + sandbox payment */
const purchaseTicket = async (req, res) => {
  try {
    const {
      ticket_type,
      visitor_name,
      visitor_phone,
      quantity,
      payment_method,
      visit_date,
    } = req.body;

    const catalog = await TicketType.findOne({
      where: { type: ticket_type, is_active: true },
    });

    if (!catalog) {
      return sendError(res, 400, 'Invalid ticket type');
    }

    const qty = parseInt(quantity, 10);
    const unitPrice = Number(catalog.price_etb);
    const totalAmount = unitPrice * qty;
    const visitDateOnly = formatDateOnly(visit_date);

    const payment = await simulatePayment({
      amount: totalAmount,
      description: `${catalog.label} x${qty}`,
      reference: `TKT-${Date.now()}`,
      payment_method,
    });

    if (!payment.success || payment.status !== 'completed') {
      return sendError(res, 402, 'Payment failed', payment);
    }

    // BE-TKT-002 — generate unique ticket QR
    const { qrTicketCode, qrDataUrl } = await generateTicketQR();

    const ticket = await Ticket.create({
      qr_ticket_code: qrTicketCode,
      ticket_type: catalog.type,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      visitor_name: String(visitor_name).trim(),
      visitor_phone: String(visitor_phone).trim(),
      visit_date: visitDateOnly,
      payment_method,
      payment_status: 'completed',
      payment_reference: payment.reference_number,
      status: 'valid',
    });

    // Section 4 purchase success shape (+ qr_data_url for digital ticket UI)
    return sendSuccess(res, 201, 'Ticket purchased successfully', {
      ticket: {
        id: ticket.id,
        qr_ticket_code: ticket.qr_ticket_code,
        ticket_type: ticket.ticket_type,
        quantity: ticket.quantity,
        total_amount: Number(ticket.total_amount),
        visitor_name: ticket.visitor_name,
        visit_date: ticket.visit_date,
        status: ticket.status,
      },
      payment_simulation: toPaymentSimulationResponse(payment),
      qr_data_url: qrDataUrl,
    });
  } catch (error) {
    return sendError(
      res,
      error.statusCode || 500,
      'Ticket purchase failed',
      error.message
    );
  }
};

/** GET /api/tickets/verify/:code — Staff gate check */
const verifyTicket = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();

    const ticket = await Ticket.findOne({
      where: { qr_ticket_code: code },
    });

    if (!ticket) {
      return sendSuccess(res, 200, 'Ticket verification complete', {
        valid: false,
        ticket: null,
        message: 'Invalid',
      });
    }

    if (ticket.status === 'used') {
      return sendSuccess(res, 200, 'Ticket verification complete', {
        valid: false,
        ticket,
        message: 'Already Used',
      });
    }

    if (ticket.status === 'cancelled' || ticket.payment_status !== 'completed') {
      return sendSuccess(res, 200, 'Ticket verification complete', {
        valid: false,
        ticket,
        message: 'Invalid',
      });
    }

    await ticket.update({ status: 'used', used_at: new Date() });
    await ticket.reload();

    return sendSuccess(res, 200, 'Ticket verification complete', {
      valid: true,
      ticket,
      message: 'Valid',
    });
  } catch (error) {
    return sendError(res, 500, 'Ticket verification failed', error.message);
  }
};

module.exports = {
  getTicketTypes,
  listTickets,
  purchaseTicket,
  verifyTicket,
  purchaseValidation,
};

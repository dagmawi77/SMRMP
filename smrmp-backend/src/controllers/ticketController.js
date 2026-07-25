/**
 * BE-TKT-001 — Ticket controller: list, purchase, verify, CRUD tickets & types
 * APIs aligned with PRD Section 4 (+ staff list & CRUD required by BE-TKT-001).
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

/** GET /api/tickets/types — Public catalog list (or all types if staff requested) */
const getTicketTypes = async (req, res) => {
  try {
    const where = {};
    if (!req.query.all && !req.query.include_inactive) {
      where.is_active = true;
    }
    const types = await TicketType.findAll({
      where,
      order: [['price_etb', 'ASC']],
    });

    return sendSuccess(res, 200, 'Ticket types retrieved', {
      ticket_types: types.map((t) => ({
        id: t.id,
        type: t.type,
        label: t.label,
        price_etb: Number(t.price_etb),
        description: t.description,
        is_active: t.is_active,
        created_at: t.created_at,
      })),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve ticket types', error.message);
  }
};

/** POST /api/tickets/types — Create new ticket type (Staff) */
const createTicketType = async (req, res) => {
  try {
    const { type, label, price_etb, description, is_active = true } = req.body;
    if (!type || !label || price_etb === undefined) {
      return sendError(res, 400, 'type, label, and price_etb are required');
    }

    const normalizedType = String(type).trim().toLowerCase().replace(/\s+/g, '_');
    const existing = await TicketType.findOne({ where: { type: normalizedType } });
    if (existing) {
      return sendError(res, 400, 'Ticket type with this identifier already exists');
    }

    const newType = await TicketType.create({
      type: normalizedType,
      label: String(label).trim(),
      price_etb: Number(price_etb),
      description: description ? String(description).trim() : null,
      is_active: Boolean(is_active),
    });

    return sendSuccess(res, 201, 'Ticket type created successfully', {
      ticket_type: newType,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to create ticket type', error.message);
  }
};

/** PUT /api/tickets/types/:id — Update existing ticket type (Staff) */
const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, price_etb, description, is_active } = req.body;

    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
      return sendError(res, 404, 'Ticket type not found');
    }

    if (label !== undefined) ticketType.label = String(label).trim();
    if (price_etb !== undefined) ticketType.price_etb = Number(price_etb);
    if (description !== undefined) ticketType.description = String(description).trim();
    if (is_active !== undefined) ticketType.is_active = Boolean(is_active);

    await ticketType.save();

    return sendSuccess(res, 200, 'Ticket type updated successfully', {
      ticket_type: ticketType,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update ticket type', error.message);
  }
};

/** DELETE /api/tickets/types/:id — Delete ticket type (Staff) */
const deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
      return sendError(res, 404, 'Ticket type not found');
    }

    await ticketType.destroy();

    return sendSuccess(res, 200, 'Ticket type deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete ticket type', error.message);
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

/** POST /api/tickets/purchase — Public purchase or staff ticket issue */
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
      where: { type: ticket_type },
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
      purchased_by_user_id: req.user?.id || null,
    });

    // Section 4 purchase success shape (+ qr_data_url for digital ticket UI)
    return sendSuccess(res, 201, 'Ticket purchased successfully', {
      ticket: {
        id: ticket.id,
        qr_ticket_code: ticket.qr_ticket_code,
        ticket_type: ticket.ticket_type,
        quantity: ticket.quantity,
        unit_price: Number(ticket.unit_price),
        total_amount: Number(ticket.total_amount),
        visitor_name: ticket.visitor_name,
        visitor_phone: ticket.visitor_phone,
        visit_date: ticket.visit_date,
        payment_method: ticket.payment_method,
        status: ticket.status,
        created_at: ticket.created_at,
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

/** GET /api/tickets/:id — Get detailed info for a single booked ticket */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    let ticket = await Ticket.findByPk(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ where: { qr_ticket_code: id } });
    }
    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }
    return sendSuccess(res, 200, 'Ticket details retrieved', { ticket });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve ticket details', error.message);
  }
};

/** PATCH /api/tickets/:id — Update booked ticket status or details (Staff) */
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { visitor_name, visitor_phone, visit_date, status, payment_status } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    if (visitor_name !== undefined) ticket.visitor_name = String(visitor_name).trim();
    if (visitor_phone !== undefined) ticket.visitor_phone = String(visitor_phone).trim();
    if (visit_date !== undefined) ticket.visit_date = formatDateOnly(visit_date);
    if (status !== undefined) {
      ticket.status = status;
      if (status === 'used' && !ticket.used_at) {
        ticket.used_at = new Date();
      }
    }
    if (payment_status !== undefined) ticket.payment_status = payment_status;

    await ticket.save();

    return sendSuccess(res, 200, 'Ticket updated successfully', {
      ticket,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update ticket', error.message);
  }
};

/** DELETE /api/tickets/:id — Delete or cancel booked ticket (Staff) */
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return sendError(res, 404, 'Ticket not found');
    }

    await ticket.destroy();

    return sendSuccess(res, 200, 'Ticket deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete ticket', error.message);
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
  createTicketType,
  updateTicketType,
  deleteTicketType,
  listTickets,
  getTicketById,
  purchaseTicket,
  updateTicket,
  deleteTicket,
  verifyTicket,
  purchaseValidation,
};

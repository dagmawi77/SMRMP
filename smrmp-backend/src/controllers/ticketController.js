const { body } = require('express-validator');
const { Ticket, TicketType } = require('../models');
const { generateTicketQR } = require('../services/qrService');
const telebirrService = require('../services/telebirrService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const validateRequest = require('../middleware/validateRequest');

const purchaseValidation = [
  body('ticket_type').trim().notEmpty(),
  body('visitor_name').trim().notEmpty(),
  body('visitor_phone').trim().notEmpty(),
  body('quantity').isInt({ min: 1, max: 50 }),
  body('payment_method').isIn(['telebirr', 'chapa', 'cash']),
  body('visit_date').isISO8601().toDate(),
  validateRequest,
];

const getTicketTypes = async (_req, res) => {
  try {
    const types = await TicketType.findAll({
      where: { is_active: true },
      order: [['price_etb', 'ASC']],
      attributes: ['type', 'label', 'price_etb', 'description'],
    });

    return sendSuccess(res, 200, 'Ticket types retrieved', {
      ticket_types: types,
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve ticket types', error.message);
  }
};

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

    const unitPrice = parseFloat(catalog.price_etb, 10);
    const totalAmount = unitPrice * quantity;

    const payment = await telebirrService.initiatePayment({
      amount: totalAmount,
      description: `${catalog.label} x${quantity}`,
      reference: `TKT-${Date.now()}`,
    });

    if (!payment.success || payment.status !== 'completed') {
      return sendError(res, 402, 'Payment failed', payment);
    }

    const { qrTicketCode } = await generateTicketQR();

    const ticket = await Ticket.create({
      qr_ticket_code: qrTicketCode,
      ticket_type: catalog.type,
      quantity,
      unit_price: unitPrice,
      total_amount: totalAmount,
      visitor_name,
      visitor_phone,
      visit_date,
      payment_method,
      payment_status: 'completed',
      payment_reference: payment.reference_number,
      status: 'valid',
    });

    return sendSuccess(res, 201, 'Ticket purchased successfully', {
      ticket: {
        id: ticket.id,
        qr_ticket_code: ticket.qr_ticket_code,
        ticket_type: ticket.ticket_type,
        quantity: ticket.quantity,
        total_amount: ticket.total_amount,
        visitor_name: ticket.visitor_name,
        visit_date: ticket.visit_date,
        status: ticket.status,
      },
      payment_simulation: {
        status: 'completed',
        reference: payment.reference_number,
        sandbox_mode: true,
        sandbox_label: 'DEMO — No real payment processed',
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Ticket purchase failed', error.message);
  }
};

const verifyTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: { qr_ticket_code: req.params.code },
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
  purchaseTicket,
  verifyTicket,
  purchaseValidation,
};

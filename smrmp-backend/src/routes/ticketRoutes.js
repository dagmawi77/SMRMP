/**
 * BE-TKT-004 — Ticket routes
 * Section 4: types, purchase, verify
 * BE-TKT-001: staff list (GET /)
 */
const express = require('express');
const {
  getTicketTypes,
  listTickets,
  purchaseTicket,
  verifyTicket,
  purchaseValidation,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { isStaff } = require('../middleware/roleGuard');

const router = express.Router();

// Public
router.get('/types', getTicketTypes);
router.post('/purchase', purchaseValidation, purchaseTicket);

// Staff / Admin
router.get('/verify/:code', protect, isStaff, verifyTicket);
router.get('/', protect, isStaff, listTickets);

module.exports = router;

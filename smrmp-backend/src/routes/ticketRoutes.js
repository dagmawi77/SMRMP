/**
 * BE-TKT-004 — Ticket routes
 * Section 4: types, purchase, verify, staff CRUD
 */
const express = require('express');
const {
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
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { isStaff } = require('../middleware/roleGuard');

const router = express.Router();

// Public
router.get('/types', getTicketTypes);
router.post('/purchase', purchaseValidation, purchaseTicket);

// Staff / Curator / Admin routes
router.get('/verify/:code', protect, isStaff, verifyTicket);
router.get('/', protect, isStaff, listTickets);
router.get('/:id', protect, isStaff, getTicketById);
router.post('/', protect, isStaff, purchaseValidation, purchaseTicket);
router.patch('/:id', protect, isStaff, updateTicket);
router.put('/:id', protect, isStaff, updateTicket);
router.delete('/:id', protect, isStaff, deleteTicket);

// Ticket Types CRUD (Staff)
router.post('/types', protect, isStaff, createTicketType);
router.put('/types/:id', protect, isStaff, updateTicketType);
router.delete('/types/:id', protect, isStaff, deleteTicketType);

module.exports = router;

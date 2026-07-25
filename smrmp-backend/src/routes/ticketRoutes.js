/**
<<<<<<< HEAD
 * Ticket routes — public types/purchase; staff list/verify via permissions
=======
 * BE-TKT-004 — Ticket routes
 * Section 4: types, purchase, verify, staff CRUD
>>>>>>> 3ca739a9eaad6200a8d402037808bf1bfc854ffa
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
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.get('/types', getTicketTypes);
router.post('/purchase', purchaseValidation, purchaseTicket);

<<<<<<< HEAD
router.get('/verify/:code', protect, requirePermission('tickets.verify'), verifyTicket);
router.get('/', protect, requirePermission('tickets.list'), listTickets);
=======
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
>>>>>>> 3ca739a9eaad6200a8d402037808bf1bfc854ffa

module.exports = router;

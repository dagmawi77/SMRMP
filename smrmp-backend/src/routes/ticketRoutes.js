/**
 * Ticket routes — public types/purchase; staff list/verify via permissions
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
const { protect, optionalProtect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.get('/types', getTicketTypes);
router.post('/types', protect, requirePermission('tickets.list'), createTicketType);
router.put('/types/:id', protect, requirePermission('tickets.list'), updateTicketType);
router.delete('/types/:id', protect, requirePermission('tickets.list'), deleteTicketType);

// Public purchase; if Bearer token present, ticket is linked to that user
router.post('/purchase', optionalProtect, purchaseValidation, purchaseTicket);

router.get('/verify/:code', protect, requirePermission('tickets.verify'), verifyTicket);
router.get('/', protect, requirePermission('tickets.list'), listTickets);
router.get('/:id', protect, requirePermission('tickets.list'), getTicketById);
router.post('/', protect, requirePermission('tickets.purchase'), purchaseValidation, purchaseTicket);
router.patch('/:id', protect, requirePermission('tickets.list'), updateTicket);
router.put('/:id', protect, requirePermission('tickets.list'), updateTicket);
router.delete('/:id', protect, requirePermission('tickets.list'), deleteTicket);

module.exports = router;

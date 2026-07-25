/**
 * Ticket routes — public types/purchase; staff list/verify via permissions
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
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.get('/types', getTicketTypes);
router.post('/purchase', purchaseValidation, purchaseTicket);

router.get('/verify/:code', protect, requirePermission('tickets.verify'), verifyTicket);
router.get('/', protect, requirePermission('tickets.list'), listTickets);

module.exports = router;

const express = require('express');
const {
  getTicketTypes,
  purchaseTicket,
  verifyTicket,
  purchaseValidation,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { isStaff } = require('../middleware/roleGuard');

const router = express.Router();

router.get('/types', getTicketTypes);
router.post('/purchase', purchaseValidation, purchaseTicket);
router.get('/verify/:code', protect, isStaff, verifyTicket);

module.exports = router;

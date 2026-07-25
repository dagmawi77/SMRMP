/**
 * Module 8 — Group / school booking routes. Public submission; staff manage.
 */
const express = require('express');
const {
  createGroupBooking,
  listGroupBookings,
  getGroupBookingById,
  updateGroupBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getTodaysBookings,
  getBookingCalendar,
  generateInvoice,
} = require('../controllers/groupBookingController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

// Public submission
router.post('/', createGroupBooking);

// Static paths before /:id
router.get('/today', protect, requirePermission('bookings.read'), getTodaysBookings);
router.get('/calendar', protect, requirePermission('bookings.read'), getBookingCalendar);

router.get('/', protect, requirePermission('bookings.read'), listGroupBookings);

router.get('/:id', protect, requirePermission('bookings.read'), getGroupBookingById);
router.put('/:id', protect, requirePermission('bookings.update'), updateGroupBooking);
router.post('/:id/confirm', protect, requirePermission('bookings.update'), confirmBooking);
router.patch('/:id/confirm', protect, requirePermission('bookings.update'), confirmBooking);
router.post('/:id/cancel', protect, requirePermission('bookings.update'), cancelBooking);
router.patch('/:id/cancel', protect, requirePermission('bookings.update'), cancelBooking);
// Complete is a lifecycle action; either manage or update is enough for Curator ops
router.post('/:id/complete', protect, requirePermission('bookings.update'), completeBooking);
router.patch('/:id/complete', protect, requirePermission('bookings.update'), completeBooking);
router.get('/:id/invoice', protect, requirePermission('bookings.read'), generateInvoice);
router.post('/:id/invoice', protect, requirePermission('bookings.update'), generateInvoice);

module.exports = router;

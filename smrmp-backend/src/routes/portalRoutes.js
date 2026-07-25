/**
 * Visitor Portal routes — authenticated + portal.* permissions.
 * All handlers are self-scoped to req.user.
 */
const express = require('express');
const {
  getDashboard,
  getMyProfile,
  updateMyProfile,
  getMyMemberships,
  getMyVisits,
  getMyTickets,
  getMyBookings,
} = require('../controllers/portalController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);

router.get('/dashboard', requirePermission('portal.read'), getDashboard);
router.get('/profile', requirePermission('portal.profile'), getMyProfile);
router.put('/profile', requirePermission('portal.profile'), updateMyProfile);
router.get('/memberships', requirePermission('portal.memberships'), getMyMemberships);
router.get('/visits', requirePermission('portal.visits'), getMyVisits);
router.get('/tickets', requirePermission('portal.tickets'), getMyTickets);
router.get('/bookings', requirePermission('portal.bookings'), getMyBookings);

module.exports = router;

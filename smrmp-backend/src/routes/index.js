const authRoutes = require('./authRoutes');
const artifactRoutes = require('./artifactRoutes');
const exhibitionRoutes = require('./exhibitionRoutes');
const conservationRoutes = require('./conservationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const ticketRoutes = require('./ticketRoutes');
const aiRoutes = require('./aiRoutes');
const narrationRoutes = require('./narrationRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const notificationRoutes = require('./notificationRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const publicVisitorRoutes = require('./publicVisitorRoutes');
const visitorRoutes = require('./visitorRoutes');
const membershipRoutes = require('./membershipRoutes');
const membershipTierRoutes = require('./membershipTierRoutes');
const groupBookingRoutes = require('./groupBookingRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const visitLogRoutes = require('./visitLogRoutes');
const portalRoutes = require('./portalRoutes');

const router = require('express').Router();

router.use('/auth', authRoutes);
router.use('/artifacts', artifactRoutes);
router.use('/exhibitions', exhibitionRoutes);
router.use('/conservation', conservationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tickets', ticketRoutes);
router.use('/ai', aiRoutes);
router.use('/narration', narrationRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/maintenance', maintenanceRoutes);

// Public Telegram / visitor surfaces
router.use('/visitor', publicVisitorRoutes);

// ─── Module 8 — Visitor & Member Management (staff CRM) ──────────
router.use('/visitors', visitorRoutes);
router.use('/memberships', membershipRoutes);
router.use('/membership-tiers', membershipTierRoutes);
router.use('/group-bookings', groupBookingRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/visit-logs', visitLogRoutes);

// ─── Visitor Portal (authenticated self-service) ─────────────────
router.use('/portal', portalRoutes);

module.exports = router;

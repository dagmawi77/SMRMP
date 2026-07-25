/**
 * Module 8 — Membership lifecycle + tiers. Tiers/card are public; the rest
 * is staff-permission gated.
 */
const express = require('express');
const {
  createMembership,
  listMemberships,
  getMembershipById,
  updateMembership,
  verifyMembership,
  renewMembership,
  cancelMembership,
  getExpiringMemberships,
  sendRenewalReminders,
  getMembershipCard,
  listTiers,
  getTierById,
  createTier,
  updateTier,
  deleteTier,
} = require('../controllers/membershipController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

// ─── Public ─────────────────────────────────────────────────────
router.get('/tiers', listTiers);
router.get('/tiers/:id', getTierById);
router.get('/:id/card', getMembershipCard);

// ─── Tier management (staff) ───────────────────────────────────
router.post('/tiers', protect, requirePermission('members.manage'), createTier);
router.put('/tiers/:id', protect, requirePermission('members.manage'), updateTier);
router.delete('/tiers/:id', protect, requirePermission('members.manage'), deleteTier);

// ─── Membership lifecycle (staff) — static paths before /:id ──
router.get('/expiring', protect, requirePermission('members.read'), getExpiringMemberships);
router.post(
  '/renewal-reminders',
  protect,
  requirePermission('members.update'),
  sendRenewalReminders
);
// PRD alias
router.post(
  '/send-reminders',
  protect,
  requirePermission('members.manage'),
  sendRenewalReminders
);
router.get('/verify/:code', protect, requirePermission('members.verify'), verifyMembership);

router.get('/', protect, requirePermission('members.read'), listMemberships);
router.post('/', protect, requirePermission('members.create'), createMembership);

router.get('/:id', protect, requirePermission('members.read'), getMembershipById);
router.put('/:id', protect, requirePermission('members.update'), updateMembership);
router.post('/:id/renew', protect, requirePermission('members.update'), renewMembership);
router.patch('/:id/renew', protect, requirePermission('members.update'), renewMembership);
router.post('/:id/cancel', protect, requirePermission('members.update'), cancelMembership);
router.patch('/:id/cancel', protect, requirePermission('members.update'), cancelMembership);

module.exports = router;

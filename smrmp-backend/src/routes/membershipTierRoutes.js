/**
 * Thin public alias mounted at /api/membership-tiers, reusing the same
 * tier controllers as /api/memberships/tiers.
 */
const express = require('express');
const {
  listTiers,
  getTierById,
  createTier,
  updateTier,
  deleteTier,
} = require('../controllers/membershipController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.get('/', listTiers);
router.get('/:id', getTierById);

router.post('/', protect, requirePermission('members.manage'), createTier);
router.put('/:id', protect, requirePermission('members.manage'), updateTier);
router.delete('/:id', protect, requirePermission('members.manage'), deleteTier);

module.exports = router;

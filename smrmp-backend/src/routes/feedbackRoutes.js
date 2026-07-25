/**
 * Module 8 — Visitor feedback routes. Public submission/browsing; staff manage.
 */
const express = require('express');
const {
  submitFeedback,
  listFeedback,
  getFeedbackById,
  updateFeedback,
  getFeedbackAnalytics,
  getPublicFeedback,
  respondToFeedback,
  publishFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

// Public
router.get('/public', getPublicFeedback);
router.post('/', submitFeedback);

// Static paths before /:id
router.get('/analytics', protect, requirePermission('feedback.read'), getFeedbackAnalytics);

router.get('/', protect, requirePermission('feedback.read'), listFeedback);

router.get('/:id', protect, requirePermission('feedback.read'), getFeedbackById);
router.put('/:id', protect, requirePermission('feedback.update'), updateFeedback);
router.post('/:id/respond', protect, requirePermission('feedback.update'), respondToFeedback);
router.patch('/:id/respond', protect, requirePermission('feedback.update'), respondToFeedback);
router.post('/:id/publish', protect, requirePermission('feedback.manage'), publishFeedback);
router.patch('/:id/publish', protect, requirePermission('feedback.manage'), publishFeedback);

module.exports = router;

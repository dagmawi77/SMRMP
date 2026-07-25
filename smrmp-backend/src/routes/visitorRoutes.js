/**
 * Module 8 — Visitor management routes. Staff-only (permission gated).
 */
const express = require('express');
const {
  listVisitors,
  createVisitor,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  checkInVisitor,
  getVisitorVisits,
  getVisitorMemberships,
  getVisitorFeedback,
  getVisitorCommunications,
  searchVisitors,
  getVisitorAnalyticsSummary,
  getVisitorAnalyticsTrends,
  getVisitorAnalyticsSegments,
  getVisitorAnalyticsFeedback,
} = require('../controllers/visitorController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);

// Static paths before /:id
router.get('/search', requirePermission('visitors.read'), searchVisitors);
router.get('/analytics/summary', requirePermission('visitors.read'), getVisitorAnalyticsSummary);
router.get('/analytics/trends', requirePermission('visitors.read'), getVisitorAnalyticsTrends);
router.get('/analytics/segments', requirePermission('visitors.read'), getVisitorAnalyticsSegments);
router.get('/analytics/feedback', requirePermission('visitors.read'), getVisitorAnalyticsFeedback);

router.get('/', requirePermission('visitors.read'), listVisitors);
router.post('/', requirePermission('visitors.create'), createVisitor);

router.get('/:id', requirePermission('visitors.read'), getVisitorById);
router.put('/:id', requirePermission('visitors.update'), updateVisitor);
router.delete('/:id', requirePermission('visitors.delete'), deleteVisitor);

router.post('/:id/checkin', requirePermission('visitors.checkin'), checkInVisitor);
// PRD alias
router.post('/:id/check-in', requirePermission('visitors.checkin'), checkInVisitor);
router.get('/:id/visits', requirePermission('visitors.read'), getVisitorVisits);
router.get('/:id/memberships', requirePermission('visitors.read'), getVisitorMemberships);
router.get('/:id/feedback', requirePermission('visitors.read'), getVisitorFeedback);
router.get('/:id/communications', requirePermission('visitors.read'), getVisitorCommunications);

module.exports = router;

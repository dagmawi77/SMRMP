/**
 * Module 8 — Gate visit log routes. Staff-only (permission gated).
 */
const express = require('express');
const {
  listVisitLogs,
  createVisitLog,
  getTodaysVisitLogs,
  getVisitLogAnalytics,
} = require('../controllers/visitLogController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);

// Static paths before /:id
router.get('/today', requirePermission('visitors.read'), getTodaysVisitLogs);
router.get('/analytics', requirePermission('visitors.read'), getVisitLogAnalytics);

router.get('/', requirePermission('visitors.read'), listVisitLogs);
router.post('/', requirePermission('visitors.checkin'), createVisitLog);

module.exports = router;

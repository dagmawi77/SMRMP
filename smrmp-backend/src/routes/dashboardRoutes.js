const express = require('express');
const { getStats, getChartData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);
router.get('/stats', requirePermission('dashboard.read'), getStats);
router.get('/charts', requirePermission('dashboard.read'), getChartData);

module.exports = router;

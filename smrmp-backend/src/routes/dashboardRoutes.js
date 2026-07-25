const express = require('express');
const { getStats, getChartData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { isCuratorPlus } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.get('/stats', isCuratorPlus, getStats);
router.get('/charts', isCuratorPlus, getChartData);

module.exports = router;

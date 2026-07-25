const express = require('express');
const {
  getDashboard,
  getRequests,
  getRequestByCode,
  closeRequest,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);
router.get('/dashboard', requirePermission('maintenance.read'), getDashboard);
router.get('/requests', requirePermission('maintenance.read'), getRequests);
router.get('/requests/:code', requirePermission('maintenance.read'), getRequestByCode);
router.patch('/requests/:code/close', requirePermission('maintenance.update'), closeRequest);

module.exports = router;

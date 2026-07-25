const express = require('express');
const {
  getAllLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  createValidation,
} = require('../controllers/conservationController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);
router.get('/', requirePermission('conservation.read'), getAllLogs);
router.post('/', requirePermission('conservation.create'), createValidation, createLog);
router.get('/:id', requirePermission('conservation.read'), getLogById);
router.put('/:id', requirePermission('conservation.update'), updateLog);
router.delete('/:id', requirePermission('conservation.delete'), deleteLog);

module.exports = router;

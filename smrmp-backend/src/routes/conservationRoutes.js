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
const { isConservationPlus, isAdmin } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.get('/', isConservationPlus, getAllLogs);
router.post('/', isConservationPlus, createValidation, createLog);
router.get('/:id', isConservationPlus, getLogById);
router.put('/:id', isConservationPlus, updateLog);
router.delete('/:id', isAdmin, deleteLog);

module.exports = router;

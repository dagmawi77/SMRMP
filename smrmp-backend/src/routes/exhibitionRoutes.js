const express = require('express');
const {
  getAllExhibitions,
  getExhibitionById,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  createValidation,
} = require('../controllers/exhibitionController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);
router.get('/', requirePermission('exhibitions.read'), getAllExhibitions);
router.post('/', requirePermission('exhibitions.create'), createValidation, createExhibition);
router.get('/:id', requirePermission('exhibitions.read'), getExhibitionById);
router.put('/:id', requirePermission('exhibitions.update'), updateExhibition);
router.delete('/:id', requirePermission('exhibitions.delete'), deleteExhibition);

module.exports = router;

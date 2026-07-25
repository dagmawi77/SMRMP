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
const { isCuratorPlus, isAdmin } = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.get('/', isCuratorPlus, getAllExhibitions);
router.post('/', isCuratorPlus, createValidation, createExhibition);
router.get('/:id', isCuratorPlus, getExhibitionById);
router.put('/:id', isCuratorPlus, updateExhibition);
router.delete('/:id', isAdmin, deleteExhibition);

module.exports = router;

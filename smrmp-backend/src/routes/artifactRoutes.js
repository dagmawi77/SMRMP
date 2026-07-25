const express = require('express');
const {
  getAllArtifacts,
  getArtifactById,
  getArtifactByQR,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  createValidation,
} = require('../controllers/artifactController');
const { protect } = require('../middleware/auth');
const { isCuratorPlus, isAdmin, isCatalogReader } = require('../middleware/roleGuard');
const { uploadHandler } = require('../middleware/uploadHandler');

const router = express.Router();

router.get('/qr/:code', getArtifactByQR);

router.use(protect);
router.get('/', isCatalogReader, getAllArtifacts);
router.post(
  '/',
  isCuratorPlus,
  uploadHandler.array('images', 5),
  createValidation,
  createArtifact
);
router.get('/:id', isCatalogReader, getArtifactById);
router.put('/:id', isCuratorPlus, uploadHandler.array('images', 5), updateArtifact);
router.delete('/:id', isAdmin, deleteArtifact);

module.exports = router;

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
const { requirePermission } = require('../middleware/permissionGuard');
const { uploadHandler } = require('../middleware/uploadHandler');

const router = express.Router();

router.get('/qr/:code', getArtifactByQR);

router.use(protect);
router.get('/', requirePermission('artifacts.read'), getAllArtifacts);
router.post(
  '/',
  requirePermission('artifacts.create'),
  uploadHandler.array('images', 5),
  createValidation,
  createArtifact
);
router.get('/:id', requirePermission('artifacts.read'), getArtifactById);
router.put(
  '/:id',
  requirePermission('artifacts.update'),
  uploadHandler.array('images', 5),
  updateArtifact
);
router.delete('/:id', requirePermission('artifacts.delete'), deleteArtifact);

module.exports = router;

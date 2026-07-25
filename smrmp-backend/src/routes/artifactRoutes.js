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
<<<<<<< HEAD
router.get('/:id', requirePermission('artifacts.read'), getArtifactById);
router.put('/:id', requirePermission('artifacts.update'), updateArtifact);
router.delete('/:id', requirePermission('artifacts.delete'), deleteArtifact);
=======
router.get('/:id', isCatalogReader, getArtifactById);
router.put('/:id', isCuratorPlus, uploadHandler.array('images', 5), updateArtifact);
router.delete('/:id', isAdmin, deleteArtifact);
>>>>>>> 3ca739a9eaad6200a8d402037808bf1bfc854ffa

module.exports = router;

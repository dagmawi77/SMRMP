const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Multer memory storage + Cloudinary SDK upload.
 * PRD lists multer-storage-cloudinary; that package peers to cloudinary@1.x
 * while the project uses cloudinary@2.x (current SDK). Functionally equivalent
 * upload pipeline via imageService.uploadArtifactImages.
 */
const uploadHandler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
    }
  },
});

module.exports = { cloudinary, uploadHandler };

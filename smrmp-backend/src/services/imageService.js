const { cloudinary } = require('../config/cloudinary');

const uploadBuffer = (buffer, mimetype) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `smrmp/artifacts/${new Date().getFullYear()}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });

const uploadArtifactImages = async (files = []) => {
  const uploads = [];

  for (const file of files) {
    const result = await uploadBuffer(file.buffer, file.mimetype);
    uploads.push({
      file_path: result.public_id,
      file_url: result.secure_url,
    });
  }

  return uploads;
};

module.exports = { uploadArtifactImages, uploadBuffer };

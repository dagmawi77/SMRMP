#!/usr/bin/env node
/**
 * BE-SETUP-006 — Smoke-test Cloudinary credentials with a tiny upload + delete.
 * Usage: node scripts/test-cloudinary.js
 */
require('dotenv').config();
const { validateEnv } = require('../src/config/environment');
const { cloudinary } = require('../src/config/cloudinary');

async function main() {
  validateEnv();

  // 1x1 PNG
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  console.log('Pinging Cloudinary...');
  const ping = await cloudinary.api.ping();
  console.log('Ping:', ping);

  console.log('Uploading test image...');
  const uploaded = await cloudinary.uploader.upload(
    `data:image/png;base64,${pngBase64}`,
    { folder: 'smrmp/setup-tests', public_id: `setup_${Date.now()}` }
  );
  console.log('Upload OK:', uploaded.secure_url);

  await cloudinary.uploader.destroy(uploaded.public_id);
  console.log('Cleanup OK — BE-SETUP-006 passed');
}

main().catch((error) => {
  console.error('BE-SETUP-006 failed:', error.message);
  console.error(
    'Replace CLOUDINARY_* values in .env with real credentials from https://cloudinary.com'
  );
  process.exit(1);
});

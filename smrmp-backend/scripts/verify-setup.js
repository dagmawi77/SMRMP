#!/usr/bin/env node
/**
 * Phase 0 setup verifier — BE-SETUP-001 … BE-SETUP-006
 * Usage: node scripts/verify-setup.js
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { required, validateEnv } = require('../src/config/environment');

const root = path.join(__dirname, '..');

const prdStructure = [
  'src/config/database.js',
  'src/config/cloudinary.js',
  'src/config/environment.js',
  'src/controllers/authController.js',
  'src/controllers/artifactController.js',
  'src/controllers/exhibitionController.js',
  'src/controllers/conservationController.js',
  'src/controllers/dashboardController.js',
  'src/controllers/ticketController.js',
  'src/controllers/paymentController.js',
  'src/controllers/aiController.js',
  'src/middleware/auth.js',
  'src/middleware/roleGuard.js',
  'src/middleware/uploadHandler.js',
  'src/middleware/validateRequest.js',
  'src/middleware/auditLogger.js',
  'src/middleware/errorHandler.js',
  'src/models/index.js',
  'src/models/User.js',
  'src/models/Artifact.js',
  'src/models/ArtifactImage.js',
  'src/models/Exhibition.js',
  'src/models/ExhibitionArtifact.js',
  'src/models/ConservationLog.js',
  'src/models/Ticket.js',
  'src/models/AuditLog.js',
  'src/routes/index.js',
  'src/routes/authRoutes.js',
  'src/routes/artifactRoutes.js',
  'src/routes/exhibitionRoutes.js',
  'src/routes/conservationRoutes.js',
  'src/routes/dashboardRoutes.js',
  'src/routes/ticketRoutes.js',
  'src/routes/aiRoutes.js',
  'src/services/qrService.js',
  'src/services/imageService.js',
  'src/services/reportService.js',
  'src/services/notificationService.js',
  'src/utils/apiResponse.js',
  'src/utils/pagination.js',
  'src/utils/dateHelpers.js',
  'src/app.js',
  'migrations',
  'seeders',
  'tests/auth.test.js',
  'tests/artifacts.test.js',
  'tests/ai.test.js',
  '.env.example',
  'package.json',
  'server.js',
];

const prdPackages = [
  'express',
  'pg',
  'sequelize',
  '@supabase/supabase-js',
  'multer',
  'cloudinary',
  'qrcode',
  'uuid',
  'express-validator',
  'cors',
  'helmet',
  'morgan',
  'dotenv',
  'express-rate-limit',
  'openai',
  'multer-storage-cloudinary',
  'nodemon',
  'jest',
  'supertest',
  'sequelize-cli',
];

async function main() {
  const results = [];

  // BE-SETUP-001
  const missingFiles = prdStructure.filter(
    (rel) => !fs.existsSync(path.join(root, rel))
  );
  results.push({
    id: 'BE-SETUP-001',
    ok: missingFiles.length === 0,
    detail:
      missingFiles.length === 0
        ? 'PRD folder structure present'
        : `Missing: ${missingFiles.join(', ')}`,
  });

  // BE-SETUP-002
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8')
  );
  const installed = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  const missingPkgs = prdPackages.filter((name) => !installed[name]);
  // multer-storage-cloudinary: optional peer-conflict workaround documented
  results.push({
    id: 'BE-SETUP-002',
    ok: missingPkgs.length === 0,
    detail:
      missingPkgs.length === 0
        ? 'Required npm packages installed'
        : `Missing packages: ${missingPkgs.join(', ')}`,
  });

  // BE-SETUP-003
  const envExists = fs.existsSync(path.join(root, '.env'));
  let envOk = false;
  let envDetail = '.env missing — copy from .env.example';
  if (envExists) {
    try {
      validateEnv();
      envOk = true;
      envDetail = `All ${required.length} required env vars present`;
    } catch (error) {
      envDetail = error.message;
    }
  }
  results.push({ id: 'BE-SETUP-003', ok: envOk, detail: envDetail });

  // BE-SETUP-005 (DB connection)
  let dbOk = false;
  let dbDetail = 'Skipped — env invalid';
  if (envOk) {
    try {
      const sequelize = require('../src/config/database');
      await sequelize.authenticate();
      dbOk = true;
      dbDetail = `Connected to ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`;
      await sequelize.close();
    } catch (error) {
      dbDetail = `Connection failed: ${error.message}`;
    }
  }
  results.push({ id: 'BE-SETUP-005', ok: dbOk, detail: dbDetail });

  // BE-SETUP-006 (Cloudinary config ping)
  let cloudOk = false;
  let cloudDetail = 'Skipped — env invalid';
  if (envOk) {
    const placeholder =
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
      process.env.CLOUDINARY_API_KEY === 'your_api_key';

    if (placeholder) {
      cloudDetail =
        'Placeholder CLOUDINARY_* in .env — set real credentials, then run: npm run setup:cloudinary';
    } else {
      try {
        const { cloudinary } = require('../src/config/cloudinary');
        const ping = await cloudinary.api.ping();
        cloudOk = true;
        cloudDetail = `Cloudinary ping OK (${JSON.stringify(ping)})`;
      } catch (error) {
        cloudDetail = `Cloudinary invalid/unreachable: ${error.message || error}`;
      }
    }
  }
  results.push({ id: 'BE-SETUP-006', ok: cloudOk, detail: cloudDetail });

  // BE-SETUP-004 informational
  results.push({
    id: 'BE-SETUP-004',
    ok: dbOk,
    detail: dbOk
      ? 'PostgreSQL database reachable'
      : 'Create local DB (see scripts/setup-postgres.sh), then re-run',
  });

  console.log('\n=== SMRMP Phase 0 Setup Verification ===\n');
  for (const row of results) {
    console.log(`${row.ok ? '✓' : '✗'} ${row.id}  ${row.detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(
    failed.length
      ? `\n${failed.length} item(s) need attention before Phase 1.\n`
      : '\nPhase 0 setup checks passed.\n'
  );
  process.exit(failed.length ? 1 : 0);
}

main();

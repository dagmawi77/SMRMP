/**
 * Addis AI story narration routes.
 *
 * The read path is public because visitors reach it by scanning an artifact QR
 * code with no account. Since a cache miss triggers a billable generation, the
 * public limiter is deliberately tight; cached hits are cheap but still capped.
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  listNarrationVoices,
  getArtifactNarration,
  generateArtifactNarration,
  getArtifactNarrationStatus,
} = require('../controllers/narrationController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

const publicNarrationLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many narration requests. Please wait a moment.',
  },
});

const staffNarrationLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many narration requests. Please wait a moment.',
  },
});

const isTest = process.env.NODE_ENV === 'test';

router.get('/voices', isTest ? [] : publicNarrationLimit, listNarrationVoices);
router.get('/artifact/:code', isTest ? [] : publicNarrationLimit, getArtifactNarration);

router.post(
  '/artifact/:id/generate',
  protect,
  requirePermission('artifacts.update'),
  ...(isTest ? [] : [staffNarrationLimit]),
  generateArtifactNarration
);

router.get(
  '/artifact/:id/status',
  protect,
  requirePermission('artifacts.read'),
  getArtifactNarrationStatus
);

module.exports = router;

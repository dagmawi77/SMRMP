const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  describeArtifact,
  smartSearch,
  generateReport,
  askAssistant,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { isCuratorPlus } = require('../middleware/roleGuard');

const router = express.Router();

// AI-specific rate limit (cost control) — PRD Section 5.2
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment.',
  },
});

router.use(protect);
if (process.env.NODE_ENV !== 'test') {
  router.use(aiRateLimit);
}

router.post('/describe-artifact', isCuratorPlus, describeArtifact);
router.post('/search', isCuratorPlus, smartSearch);
router.post('/generate-report', isCuratorPlus, generateReport);
router.post('/ask', isCuratorPlus, askAssistant);

module.exports = router;

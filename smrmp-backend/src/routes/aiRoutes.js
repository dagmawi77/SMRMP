const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  describeArtifact,
  smartSearch,
  generateReport,
  askAssistant,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

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

router.post('/describe-artifact', requirePermission('ai.describe'), describeArtifact);
router.post('/search', requirePermission('ai.search'), smartSearch);
router.post('/generate-report', requirePermission('ai.report'), generateReport);
router.post('/ask', requirePermission('ai.ask'), askAssistant);

module.exports = router;

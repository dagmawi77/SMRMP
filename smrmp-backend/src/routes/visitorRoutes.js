/**
 * Public visitor endpoints for the Telegram bot and visitor web surfaces.
 * No auth required — rate-limited at the router level.
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getMuseumInfo,
  getPublicExhibitions,
  askVisitorGuide,
  submitFeedback,
  getTicketByCode,
} = require('../controllers/visitorController');

const router = express.Router();

const visitorLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many visitor requests. Please wait a moment.',
});

const askLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many AI questions. Please wait a moment.',
});

if (process.env.NODE_ENV !== 'test') {
  router.use(visitorLimit);
}

router.get('/info', getMuseumInfo);
router.get('/exhibitions', getPublicExhibitions);
router.get('/tickets/:code', getTicketByCode);
router.post('/ask', askLimit, askVisitorGuide);
router.post('/feedback', submitFeedback);

module.exports = router;

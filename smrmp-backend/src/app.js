const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Required behind Render / reverse proxies so rate-limit + req.ip use the real client IP
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// FRONTEND_URL stays a single canonical origin (it is baked into QR codes and
// emailed links). CORS_ORIGINS optionally adds more allowed browser origins —
// e.g. a LAN address used for testing the visitor QR flow on a phone.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(','),
]
  .map((origin) => origin && origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin/non-browser callers (curl, native camera app) send no Origin.
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }
      // Omit the CORS headers rather than throwing, so the browser blocks the
      // response without the request surfacing as a 500.
      return callback(null, false);
    },
    credentials: true,
  })
);

// Rate limiting (disabled in test)
// Auth limiter is stricter in production; development allows more retries while testing roles.
if (process.env.NODE_ENV !== 'test') {
  const isDev = process.env.NODE_ENV === 'development';
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 100 : 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many login attempts. Try again in 15 minutes.',
    })
  );

  app.use(
    '/api/',
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max: isDev ? 1000 : 200,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check — PRD Section 2.5
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'SMRMP API',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;

/**
 * Environment validation — PRD Section 2.1 + Section 6 master list.
 * Application fails fast on startup if required variables are missing.
 */
const required = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'TELEBIRR_APP_ID',
  'TELEBIRR_APP_KEY',
  'TELEBIRR_SHORT_CODE',
  'TELEBIRR_PUBLIC_KEY',
  'TELEBIRR_BASE_URL',
  'FRONTEND_URL',
  'API_BASE_URL',
];

function validateEnv() {
  const missing = required.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

module.exports = { validateEnv, required };

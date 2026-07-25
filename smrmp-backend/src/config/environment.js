/**
 * Environment validation — fails fast on startup if required vars are missing.
 * Auth is Supabase Auth (not local JWT). DB accepts DB_* or DATABASE_URL.
 */
const alwaysRequired = [
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
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

const dbDiscrete = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

function isBlank(key) {
  const value = process.env[key];
  return value === undefined || value === null || String(value).trim() === '';
}

function validateEnv() {
  const missing = alwaysRequired.filter(isBlank);

  // PORT is set automatically by Render; required locally
  if (isBlank('PORT') && process.env.NODE_ENV !== 'production') {
    missing.push('PORT');
  }

  const hasDatabaseUrl = !isBlank('DATABASE_URL');
  if (!hasDatabaseUrl) {
    missing.push(...dbDiscrete.filter(isBlank));
  }

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

module.exports = {
  validateEnv,
  required: [...alwaysRequired, ...dbDiscrete, 'PORT', 'DATABASE_URL'],
};

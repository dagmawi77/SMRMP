const path = require('path');

// Ensure test environment uses local database settings to protect remote/Supabase DB
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '5435';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'smrmp_db_test';
process.env.DB_USER = process.env.TEST_DB_USER || 'smrmp_user';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'smrmp_pass';
process.env.DB_SSL = 'false';

// Load .env, but preserve test DB overrides set above
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Safety guard: NEVER allow tests with sync({ force: true }) to run against Supabase
if (process.env.DB_HOST && process.env.DB_HOST.includes('supabase.com')) {
  throw new Error('CRITICAL SAFETY BLOCK: Tests are configured to target Supabase. Halting to prevent database wipe.');
}
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test_jwt_secret_key_with_32_chars_min';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-test';
process.env.OPENAI_MODEL = 'gpt-4o-mini';
process.env.TELEBIRR_APP_ID = 'sandbox';
process.env.TELEBIRR_APP_KEY = 'sandbox';
process.env.TELEBIRR_SHORT_CODE = 'sandbox';
process.env.TELEBIRR_PUBLIC_KEY = 'sandbox';
process.env.TELEBIRR_BASE_URL = 'https://sandbox.telebirr.com';

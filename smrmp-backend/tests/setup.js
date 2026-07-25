const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '5001';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5435';
// Always isolate tests from the development database
process.env.DB_NAME = process.env.DB_NAME_TEST || 'smrmp_db_test';
process.env.DB_USER = process.env.DB_USER || 'smrmp_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'smrmp_pass';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test_jwt_secret_key_with_32_chars_min';
process.env.JWT_EXPIRES_IN = '1h';
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
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

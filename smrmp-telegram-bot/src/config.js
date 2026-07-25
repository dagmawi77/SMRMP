const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return String(value).trim();
}

const config = {
  botToken: required('TELEGRAM_BOT_TOKEN'),
  apiUrl: (process.env.SMRMP_API_URL || 'http://localhost:5000/api').replace(/\/$/, ''),
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  museumName: process.env.MUSEUM_NAME || 'Adwa Victory Memorial Museum',
  museumPhone: process.env.MUSEUM_PHONE || null,
  mode: (process.env.BOT_MODE || 'polling').toLowerCase(),
  webhookDomain: process.env.WEBHOOK_DOMAIN || '',
  webhookPath: process.env.WEBHOOK_PATH || '/telegram/webhook',
  port: parseInt(process.env.PORT, 10) || 5001,
};

module.exports = config;

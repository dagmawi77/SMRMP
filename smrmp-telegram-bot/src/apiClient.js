const axios = require('axios');
const config = require('./config');

const client = axios.create({
  baseURL: config.apiUrl,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
});

function logApiError(label, error) {
  const status = error.response?.status;
  const msg = error.response?.data?.message || error.message;
  console.error(`[api] ${label}:`, status || 'NO_RESPONSE', msg);
}

function unwrap(response) {
  const body = response.data;
  if (!body || body.success === false) {
    const err = new Error(body?.message || 'API request failed');
    err.status = response.status;
    err.payload = body;
    throw err;
  }
  return body.data;
}

async function getMuseumInfo() {
  try {
    const res = await client.get('/visitor/info');
    return unwrap(res).info;
  } catch (error) {
    logApiError('GET /visitor/info', error);
    throw error;
  }
}

async function getExhibitions(status = 'current') {
  try {
    const res = await client.get('/visitor/exhibitions', {
      params: { status, limit: 15 },
    });
    return unwrap(res).exhibitions || [];
  } catch (error) {
    logApiError('GET /visitor/exhibitions', error);
    throw error;
  }
}

async function getArtifactByQR(code) {
  try {
    const res = await client.get(`/artifacts/qr/${encodeURIComponent(code)}`);
    return unwrap(res);
  } catch (error) {
    logApiError(`GET /artifacts/qr/${code}`, error);
    throw error;
  }
}

async function getTicketTypes() {
  try {
    const res = await client.get('/tickets/types');
    return unwrap(res).ticket_types || [];
  } catch (error) {
    logApiError('GET /tickets/types', error);
    throw error;
  }
}

async function getTicketByCode(code) {
  try {
    const res = await client.get(`/visitor/tickets/${encodeURIComponent(code)}`);
    return unwrap(res).ticket;
  } catch (error) {
    logApiError(`GET /visitor/tickets/${code}`, error);
    throw error;
  }
}

async function askGuide(question, language = 'en') {
  try {
    const res = await client.post('/visitor/ask', { question, language });
    return unwrap(res);
  } catch (error) {
    logApiError('POST /visitor/ask', error);
    throw error;
  }
}

async function submitFeedback(payload) {
  try {
    const res = await client.post('/visitor/feedback', payload);
    return unwrap(res);
  } catch (error) {
    logApiError('POST /visitor/feedback', error);
    throw error;
  }
}

async function pingApi() {
  try {
    const base = config.apiUrl.replace(/\/api\/?$/, '');
    const res = await axios.get(`${base}/health`, { timeout: 5000 });
    return res.data;
  } catch (error) {
    logApiError('GET /health', error);
    return null;
  }
}

module.exports = {
  getMuseumInfo,
  getExhibitions,
  getArtifactByQR,
  getTicketTypes,
  getTicketByCode,
  askGuide,
  submitFeedback,
  pingApi,
};

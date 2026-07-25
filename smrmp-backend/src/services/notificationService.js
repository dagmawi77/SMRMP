/**
 * Lightweight notification stub — PRD lists the service file but does not
 * define email/SMS delivery for MVP.
 */
const notifyStaff = async ({ type, message, metadata = {} }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[NOTIFY]', { type, message, metadata });
  }
  return { delivered: false, channel: 'stub', type, message };
};

module.exports = { notifyStaff };

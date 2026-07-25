const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return sendError(res, 400, 'Validation error', messages);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, 409, 'A record with this value already exists');
  }

  if (err.name === 'MulterError') {
    return sendError(res, 400, err.message);
  }

  return sendError(
    res,
    err.statusCode || err.status || 500,
    err.message || 'Internal server error'
  );
};

module.exports = errorHandler;

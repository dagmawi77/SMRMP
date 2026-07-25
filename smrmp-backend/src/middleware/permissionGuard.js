const { sendError } = require('../utils/apiResponse');

const requirePermission = (...codes) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }
    const permissions = req.user.permissions || [];
    const missing = codes.filter((code) => !permissions.includes(code));
    if (missing.length) {
      return sendError(
        res,
        403,
        `Access denied. Required permission(s): ${codes.join(', ')}`
      );
    }
    return next();
  };
};

const requireAnyPermission = (...codes) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }
    const permissions = req.user.permissions || [];
    if (!codes.some((code) => permissions.includes(code))) {
      return sendError(
        res,
        403,
        `Access denied. Requires one of: ${codes.join(', ')}`
      );
    }
    return next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
};

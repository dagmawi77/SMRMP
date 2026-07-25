const { sendError } = require('../utils/apiResponse');

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role(s): ${roles.join(', ')}`
      );
    }
    return next();
  };
};

const isAdmin = allowRoles('admin');
const isCuratorPlus = allowRoles('admin', 'curator');
const isStaff = allowRoles('admin', 'curator', 'conservation', 'maintenance');
const isConservationPlus = allowRoles('admin', 'curator', 'conservation');

module.exports = {
  allowRoles,
  isAdmin,
  isCuratorPlus,
  isStaff,
  isConservationPlus,
};

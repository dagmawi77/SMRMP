function auditLogger(action) {
  return (req, _res, next) => {
    req.audit = {
      action,
      userId: req.user?.id || null,
      ip: req.ip,
      at: new Date().toISOString(),
    };
    return next();
  };
}

module.exports = { auditLogger };

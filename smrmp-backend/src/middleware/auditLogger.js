const { AuditLog } = require('../models');

/**
 * Persist an audit trail entry. Non-blocking failures are logged only.
 */
const writeAuditLog = async ({
  userId,
  action,
  tableName,
  recordId,
  oldValues = null,
  newValues = null,
  ipAddress = null,
}) => {
  try {
    await AuditLog.create({
      user_id: userId || null,
      action,
      table_name: tableName,
      record_id: recordId || null,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error('[AUDIT] Failed to write audit log:', error.message);
  }
};

module.exports = { writeAuditLog };

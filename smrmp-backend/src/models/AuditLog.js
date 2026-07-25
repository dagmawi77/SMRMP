const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define AuditLog model fields and associations
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'auditlogs',
  timestamps: true,
});

module.exports = AuditLog;

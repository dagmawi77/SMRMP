const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define ConservationLog model fields and associations
const ConservationLog = sequelize.define('ConservationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'conservationlogs',
  timestamps: true,
});

module.exports = ConservationLog;

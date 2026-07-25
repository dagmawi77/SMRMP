const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define Exhibition model fields and associations
const Exhibition = sequelize.define('Exhibition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'exhibitions',
  timestamps: true,
});

module.exports = Exhibition;

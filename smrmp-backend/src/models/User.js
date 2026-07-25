const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define User model fields and associations
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;

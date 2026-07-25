const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define Ticket model fields and associations
const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'tickets',
  timestamps: true,
});

module.exports = Ticket;

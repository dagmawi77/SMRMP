const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ENTRY_METHODS = [
  'qr_ticket',
  'membership_card',
  'group_booking',
  'cash_counter',
  'comp',
  'staff_assisted',
];

const VisitLog = sequelize.define(
  'VisitLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    visitor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'visitors', key: 'id' },
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'tickets', key: 'id' },
    },
    group_booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'group_bookings', key: 'id' },
    },
    staff_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    entry_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: { args: [ENTRY_METHODS], msg: 'Invalid entry_method' },
      },
    },
    visitor_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    entry_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    exit_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'visit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

VisitLog.ENTRY_METHODS = ENTRY_METHODS;

module.exports = VisitLog;

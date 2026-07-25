const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CHANNELS = ['email', 'sms', 'push'];
const TYPES = [
  'renewal_reminder',
  'welcome',
  'feedback_request',
  'promotion',
  'booking_confirmation',
  'other',
];
const STATUSES = ['queued', 'sent', 'failed'];

const VisitorCommunication = sequelize.define(
  'VisitorCommunication',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    visitor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'visitors', key: 'id' },
    },
    channel: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'email',
      validate: { isIn: { args: [CHANNELS], msg: 'Invalid channel' } },
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'other',
      validate: { isIn: { args: [TYPES], msg: 'Invalid type' } },
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'sent',
      validate: { isIn: { args: [STATUSES], msg: 'Invalid status' } },
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'visitor_communications',
    timestamps: false,
  }
);

VisitorCommunication.CHANNELS = CHANNELS;
VisitorCommunication.TYPES = TYPES;
VisitorCommunication.STATUSES = STATUSES;

module.exports = VisitorCommunication;

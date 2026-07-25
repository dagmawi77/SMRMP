const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GROUP_TYPES = ['school', 'tourist', 'corporate', 'family', 'other'];
const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'waived'];

const GroupBooking = sequelize.define(
  'GroupBooking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_reference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    group_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    group_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'other',
      validate: { isIn: { args: [GROUP_TYPES], msg: 'Invalid group_type' } },
    },
    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: { msg: 'Must be a valid email address' } },
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    visitor_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 2 },
    },
    visit_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    visit_time: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    guide_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    special_requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price_per_person: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: { args: [BOOKING_STATUSES], msg: 'Invalid status' } },
    },
    payment_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: { args: [PAYMENT_STATUSES], msg: 'Invalid payment_status' } },
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    assigned_staff_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'group_bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

GroupBooking.GROUP_TYPES = GROUP_TYPES;
GroupBooking.BOOKING_STATUSES = BOOKING_STATUSES;
GroupBooking.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = GroupBooking;

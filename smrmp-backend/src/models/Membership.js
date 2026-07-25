const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const STATUSES = ['pending', 'active', 'expired', 'cancelled'];
const PAYMENT_METHODS = ['telebirr', 'chapa', 'cash', 'bank'];

const Membership = sequelize.define(
  'Membership',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    membership_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    visitor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'visitors', key: 'id' },
    },
    tier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'membership_tiers', key: 'id' },
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: { args: [STATUSES], msg: 'Invalid status' } },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    price_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: { isIn: { args: [PAYMENT_METHODS], msg: 'Invalid payment_method' } },
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    qr_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    card_issued: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    renewal_reminder_sent_at: {
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'memberships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Membership.prototype.isActive = function isActive() {
  if (this.status !== 'active') return false;
  const today = new Date().toISOString().slice(0, 10);
  return this.end_date >= today;
};

Membership.prototype.daysUntilExpiry = function daysUntilExpiry() {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const end = new Date(this.end_date);
  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

Membership.prototype.isExpiringSoon = function isExpiringSoon(days = 30) {
  if (this.status !== 'active') return false;
  const remaining = this.daysUntilExpiry();
  return remaining >= 0 && remaining <= days;
};

Membership.STATUSES = STATUSES;
Membership.PAYMENT_METHODS = PAYMENT_METHODS;

module.exports = Membership;

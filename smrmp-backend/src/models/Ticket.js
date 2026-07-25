const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    qr_ticket_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    ticket_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    visitor_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    visitor_phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    visit_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('telebirr', 'chapa', 'cash'),
      allowNull: false,
      defaultValue: 'telebirr',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('valid', 'used', 'cancelled'),
      allowNull: false,
      defaultValue: 'valid',
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purchased_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Ticket;

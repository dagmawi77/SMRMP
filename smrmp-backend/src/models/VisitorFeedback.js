const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VisitorFeedback = sequelize.define(
  'VisitorFeedback',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    telegram_user_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    telegram_username: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    visitor_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(8),
      allowNull: true,
      defaultValue: 'en',
    },
    source: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'telegram',
    },
  },
  {
    tableName: 'visitor_feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = VisitorFeedback;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConservationLog = sequelize.define(
  'ConservationLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    artifact_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'artifacts',
        key: 'id',
      },
    },
    inspector_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    condition_before: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
      allowNull: true,
    },
    condition_after: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    action_taken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    next_inspection_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    requires_restoration: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    restoration_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    inspected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'conservation_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = ConservationLog;

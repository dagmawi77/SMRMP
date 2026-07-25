const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaintenanceRequest = sequelize.define(
  'MaintenanceRequest',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_code: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Medium',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'New',
    },
    reported_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    report_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    building: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    floor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    room: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    hall: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    artifact_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    artifact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    equipment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    equipment_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigned_to: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    assigned_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    estimated_completion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_emergency: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    timeline: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    comments: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: 'maintenance_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = MaintenanceRequest;

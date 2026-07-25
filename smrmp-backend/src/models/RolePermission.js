const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define(
  'RolePermission',
  {
    role_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    permission_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
  },
  {
    tableName: 'role_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = RolePermission;

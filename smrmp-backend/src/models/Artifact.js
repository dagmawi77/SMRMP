const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define Artifact model fields and associations
const Artifact = sequelize.define('Artifact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'artifacts',
  timestamps: true,
});

module.exports = Artifact;

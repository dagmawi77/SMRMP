const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define ExhibitionArtifact model fields and associations
const ExhibitionArtifact = sequelize.define('ExhibitionArtifact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'exhibitionartifacts',
  timestamps: true,
});

module.exports = ExhibitionArtifact;

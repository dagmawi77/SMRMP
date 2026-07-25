const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: define ArtifactImage model fields and associations
const ArtifactImage = sequelize.define('ArtifactImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
}, {
  tableName: 'artifactimages',
  timestamps: true,
});

module.exports = ArtifactImage;

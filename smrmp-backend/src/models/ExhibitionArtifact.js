const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExhibitionArtifact = sequelize.define(
  'ExhibitionArtifact',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exhibition_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'exhibitions', key: 'id' },
    },
    artifact_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'artifacts', key: 'id' },
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'exhibition_artifacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['exhibition_id', 'artifact_id'],
      },
    ],
  }
);

module.exports = ExhibitionArtifact;

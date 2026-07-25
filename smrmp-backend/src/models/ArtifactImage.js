const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArtifactImage = sequelize.define(
  'ArtifactImage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    artifact_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'artifacts', key: 'id' },
      onDelete: 'CASCADE',
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'artifact_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = ArtifactImage;

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
<<<<<<< HEAD
      references: {
        model: 'artifacts',
        key: 'id',
      },
      onDelete: 'CASCADE',
=======
      references: { model: 'artifacts', key: 'id' },
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_url: {
<<<<<<< HEAD
      type: DataTypes.STRING(1000),
=======
      type: DataTypes.STRING(500),
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
<<<<<<< HEAD
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'artifact_images',
    timestamps: false,
=======
  },
  {
    tableName: 'artifact_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
  }
);

module.exports = ArtifactImage;

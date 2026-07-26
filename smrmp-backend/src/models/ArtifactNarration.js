const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * A generated Addis AI narration clip, cached so each artifact is only ever
 * billed once per (language, voice, text) combination. `text_hash` is what makes
 * the cache self-invalidating: when a curator edits the description the hash
 * changes and the next request regenerates.
 */
const ArtifactNarration = sequelize.define(
  'ArtifactNarration',
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
    },
    language: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    voice_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    voice_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    text_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    source_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'addis_ai',
    },
    provider_clip_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Permanent Cloudinary URL. The provider's own audio_url is a signed link
    // that expires within the hour, so it is never stored.
    audio_url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    storage_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cost_etb: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    generated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'artifact_narrations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        name: 'artifact_narrations_lookup_unique',
        fields: ['artifact_id', 'language', 'voice_id', 'text_hash'],
      },
    ],
  }
);

module.exports = ArtifactNarration;

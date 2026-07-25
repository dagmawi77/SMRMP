const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artifact = sequelize.define(
  'Artifact',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: false,
<<<<<<< HEAD
      validate: {
        notEmpty: true,
      },
=======
      validate: { notEmpty: true },
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
    },
    category: {
      type: DataTypes.ENUM(
        'weapon',
        'textile',
        'document',
        'ceramic',
        'jewelry',
        'ceremonial',
        'photograph',
        'coin',
        'other'
      ),
      allowNull: false,
    },
    historical_period: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    materials: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ai_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description_source: {
      type: DataTypes.ENUM('manual', 'ai_approved', 'ai_draft'),
      defaultValue: 'manual',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    condition_status: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
      defaultValue: 'good',
    },
    qr_code: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    is_on_loan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
<<<<<<< HEAD
      references: {
        model: 'users',
        key: 'id',
      },
=======
      references: { model: 'users', key: 'id' },
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
    },
    last_edited_by: {
      type: DataTypes.UUID,
      allowNull: true,
<<<<<<< HEAD
      references: {
        model: 'users',
        key: 'id',
      },
=======
      references: { model: 'users', key: 'id' },
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
    },
  },
  {
    tableName: 'artifacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

module.exports = Artifact;

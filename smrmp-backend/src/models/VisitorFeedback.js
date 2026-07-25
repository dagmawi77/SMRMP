const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CATEGORIES = ['exhibition', 'staff', 'facility', 'ticketing', 'overall', 'other'];
const STATUSES = ['new', 'reviewed', 'responded', 'published', 'archived'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

const VisitorFeedback = sequelize.define(
  'VisitorFeedback',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    visitor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'visitors', key: 'id' },
    },
    visit_log_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'visit_logs', key: 'id' },
    },
    visitor_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    visitor_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: { msg: 'Must be a valid email address' } },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'overall',
      validate: { isIn: { args: [CATEGORIES], msg: 'Invalid category' } },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentiment: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: { isIn: { args: [SENTIMENTS], msg: 'Invalid sentiment' } },
    },
    sentiment_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    ai_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ai_tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'new',
      validate: { isIn: { args: [STATUSES], msg: 'Invalid status' } },
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    response_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responded_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'visitor_feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

VisitorFeedback.CATEGORIES = CATEGORIES;
VisitorFeedback.STATUSES = STATUSES;
VisitorFeedback.SENTIMENTS = SENTIMENTS;

module.exports = VisitorFeedback;

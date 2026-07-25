const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visitor = sequelize.define(
  'Visitor',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true },
    },
    last_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: { msg: 'Must be a valid email address' } },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    national_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    visitor_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'individual',
      validate: {
        isIn: {
          args: [['individual', 'group', 'student', 'vip', 'member', 'researcher']],
          msg: 'Invalid visitor_type',
        },
      },
    },
    photo_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    preferred_language: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'en',
    },
    marketing_opt_in: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_blacklisted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    total_visits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    last_visit_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    registered_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    user_account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'visitors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

Visitor.prototype.getFullName = function getFullName() {
  return [this.first_name, this.last_name].filter(Boolean).join(' ').trim();
};

Visitor.prototype.toPublic = function toPublic() {
  return {
    id: this.id,
    full_name: this.getFullName(),
    email: this.email,
    phone: this.phone,
    visitor_type: this.visitor_type,
    total_visits: this.total_visits,
    last_visit_at: this.last_visit_at,
  };
};

module.exports = Visitor;

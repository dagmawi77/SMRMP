const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Staff profile table. Authentication (password / session) is owned by
 * Supabase Auth (auth.users). Prefer public.users.id === auth.users.id.
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 255] },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    // Legacy column — passwords are managed by Supabase Auth now.
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(
        'admin',
        'curator',
        'conservation',
        'maintenance',
        'researcher',
        'visitor'
      ),
      allowNull: false,
      defaultValue: 'visitor',
    },
    museum_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: (user) => {
        if (user.email) user.email = user.email.toLowerCase();
      },
      beforeUpdate: (user) => {
        if (user.changed('email') && user.email) {
          user.email = user.email.toLowerCase();
        }
      },
    },
  }
);

User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;

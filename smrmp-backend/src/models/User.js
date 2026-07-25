const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

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
<<<<<<< HEAD
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
=======
      validate: { notEmpty: true, len: [2, 255] },
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
<<<<<<< HEAD
      validate: {
        isEmail: true,
      },
=======
      validate: { isEmail: true },
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
      beforeCreate: async (user) => {
<<<<<<< HEAD
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
=======
        if (user.email) user.email = user.email.toLowerCase();
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed('email') && user.email) {
          user.email = user.email.toLowerCase();
        }
>>>>>>> 0f005c99d2a9ec51477d9d1957078fd8acffbfad
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;

'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('users', 'username', {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('users', 'phone', {
      type: DataTypes.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'gender', {
      type: DataTypes.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'date_of_birth', {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'nationality', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'national_id', {
      type: DataTypes.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'national_id');
    await queryInterface.removeColumn('users', 'nationality');
    await queryInterface.removeColumn('users', 'date_of_birth');
    await queryInterface.removeColumn('users', 'gender');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'username');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.changeColumn('users', 'password', {
      type: require('sequelize').STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.changeColumn('users', 'password', {
      type: require('sequelize').STRING(255),
      allowNull: false,
    });
  },
};

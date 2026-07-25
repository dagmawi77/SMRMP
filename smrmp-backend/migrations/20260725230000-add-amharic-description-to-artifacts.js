'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('artifacts');
    if (!tableInfo.amharic_description) {
      await queryInterface.addColumn('artifacts', 'amharic_description', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('artifacts');
    if (tableInfo.amharic_description) {
      await queryInterface.removeColumn('artifacts', 'amharic_description');
    }
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('artifacts');
    if (!tableInfo.staff_notes) {
      await queryInterface.addColumn('artifacts', 'staff_notes', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('artifacts');
    if (tableInfo.staff_notes) {
      await queryInterface.removeColumn('artifacts', 'staff_notes');
    }
  },
};

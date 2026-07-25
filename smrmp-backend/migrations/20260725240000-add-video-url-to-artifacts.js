'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('artifacts');
    if (!tableInfo.video_url) {
      await queryInterface.addColumn('artifacts', 'video_url', {
        type: Sequelize.STRING(1000),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('artifacts');
    if (tableInfo.video_url) {
      await queryInterface.removeColumn('artifacts', 'video_url');
    }
  },
};

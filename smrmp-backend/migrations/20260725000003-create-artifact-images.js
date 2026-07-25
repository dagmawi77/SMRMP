'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('artifact_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      artifact_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'artifacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      file_path: { type: Sequelize.STRING(500), allowNull: false },
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('artifact_images', ['artifact_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('artifact_images');
  },
};

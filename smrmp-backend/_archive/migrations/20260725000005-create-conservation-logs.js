'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conservation_logs', {
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
      inspector_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      condition_before: {
        type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
        allowNull: true,
      },
      condition_after: {
        type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
        allowNull: true,
      },
      observations: { type: Sequelize.TEXT, allowNull: true },
      action_taken: { type: Sequelize.TEXT, allowNull: true },
      next_inspection_date: { type: Sequelize.DATEONLY, allowNull: true },
      requires_restoration: { type: Sequelize.BOOLEAN, defaultValue: false },
      inspected_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
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

    await queryInterface.addIndex('conservation_logs', ['artifact_id']);
    await queryInterface.addIndex('conservation_logs', ['inspector_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('conservation_logs');
  },
};

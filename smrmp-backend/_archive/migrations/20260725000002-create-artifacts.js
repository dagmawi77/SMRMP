'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('artifacts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: { type: Sequelize.STRING(500), allowNull: false },
      category: {
        type: Sequelize.ENUM(
          'weapon',
          'textile',
          'document',
          'ceramic',
          'jewelry',
          'ceremonial',
          'photograph',
          'coin',
          'other'
        ),
        allowNull: false,
      },
      historical_period: { type: Sequelize.STRING(255), allowNull: true },
      origin: { type: Sequelize.STRING(255), allowNull: true },
      materials: { type: Sequelize.TEXT, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      ai_description: { type: Sequelize.TEXT, allowNull: true },
      description_source: {
        type: Sequelize.ENUM('manual', 'ai_approved', 'ai_draft'),
        defaultValue: 'manual',
      },
      location: { type: Sequelize.STRING(255), allowNull: true },
      condition_status: {
        type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor', 'critical'),
        defaultValue: 'good',
      },
      qr_code: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      keywords: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      is_on_loan: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      last_edited_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('artifacts', ['qr_code'], { unique: true });
    await queryInterface.addIndex('artifacts', ['category']);
    await queryInterface.addIndex('artifacts', ['condition_status']);
    await queryInterface.addIndex('artifacts', ['location']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('artifacts');
  },
};

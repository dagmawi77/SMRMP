'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('artifact_narrations')) return;

    await queryInterface.createTable('artifact_narrations', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      artifact_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'artifacts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      language: { type: Sequelize.STRING(5), allowNull: false },
      voice_id: { type: Sequelize.STRING(100), allowNull: false },
      voice_name: { type: Sequelize.STRING(100), allowNull: true },
      text_hash: { type: Sequelize.STRING(64), allowNull: false },
      source_text: { type: Sequelize.TEXT, allowNull: false },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'addis_ai',
      },
      provider_clip_id: { type: Sequelize.STRING(100), allowNull: true },
      audio_url: { type: Sequelize.STRING(1000), allowNull: false },
      storage_path: { type: Sequelize.STRING(500), allowNull: true },
      mime_type: { type: Sequelize.STRING(100), allowNull: true },
      duration_seconds: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      cost_etb: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
      generated_by: {
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
    });

    // Guarantees one paid clip per artifact + language + voice + exact text.
    await queryInterface.addIndex('artifact_narrations', {
      name: 'artifact_narrations_lookup_unique',
      unique: true,
      fields: ['artifact_id', 'language', 'voice_id', 'text_hash'],
    });

    await queryInterface.addIndex('artifact_narrations', {
      name: 'artifact_narrations_artifact_language_idx',
      fields: ['artifact_id', 'language'],
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('artifact_narrations')) {
      await queryInterface.dropTable('artifact_narrations');
    }
  },
};

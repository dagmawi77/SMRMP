'use strict';

const { DataTypes } = require('sequelize');

/**
 * An older DB may already have `visitor_feedback` (telegram kiosk schema) from a
 * migration no longer in this repo. Module 8 needs a richer schema on the same
 * table name. Rename the legacy table first, then create the Module 8 table.
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t));

    if (names.includes('visitor_feedback')) {
      const desc = await queryInterface.describeTable('visitor_feedback');
      const isLegacyTelegram = Boolean(desc.telegram_user_id) && !desc.visitor_id;
      if (isLegacyTelegram) {
        if (!names.includes('visitor_feedback_telegram_legacy')) {
          await queryInterface.renameTable('visitor_feedback', 'visitor_feedback_telegram_legacy');
        } else {
          await queryInterface.dropTable('visitor_feedback', { cascade: true });
        }
      }
    }

    const tablesAfter = await queryInterface.showAllTables();
    const namesAfter = tablesAfter.map((t) => (typeof t === 'string' ? t : t.tableName || t));
    if (namesAfter.includes('visitor_feedback')) {
      const desc = await queryInterface.describeTable('visitor_feedback');
      if (desc.visitor_id) return; // already Module 8 shape
    }

    await queryInterface.createTable('visitor_feedback', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      visitor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'visitors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      visit_log_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'visit_logs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      visitor_name: { type: DataTypes.STRING(255), allowNull: true },
      visitor_email: { type: DataTypes.STRING(255), allowNull: true },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      category: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'overall' },
      comment: { type: DataTypes.TEXT, allowNull: true },
      sentiment: { type: DataTypes.STRING(20), allowNull: true },
      sentiment_score: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
      ai_summary: { type: DataTypes.TEXT, allowNull: true },
      ai_tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
      status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'new' },
      is_public: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      response_text: { type: DataTypes.TEXT, allowNull: true },
      responded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      responded_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "visitor_feedback_visitor_id" ON "visitor_feedback" ("visitor_id")'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "visitor_feedback_status" ON "visitor_feedback" ("status")'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "visitor_feedback_rating" ON "visitor_feedback" ("rating")'
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "visitor_feedback_is_public" ON "visitor_feedback" ("is_public")'
    );
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t));
    if (names.includes('visitor_feedback')) {
      const desc = await queryInterface.describeTable('visitor_feedback');
      if (desc.visitor_id) {
        await queryInterface.dropTable('visitor_feedback', { cascade: true });
      }
    }
    if (names.includes('visitor_feedback_telegram_legacy')) {
      await queryInterface.renameTable('visitor_feedback_telegram_legacy', 'visitor_feedback');
    }
  },
};

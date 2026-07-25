'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('visitor_feedback', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      telegram_user_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      telegram_username: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      visitor_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING(8),
        allowNull: true,
        defaultValue: 'en',
      },
      source: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'telegram',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex('visitor_feedback', ['rating']);
    await queryInterface.addIndex('visitor_feedback', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('visitor_feedback');
  },
};

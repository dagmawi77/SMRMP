'use strict';

const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('ticket_types', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      label: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price_etb: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    const now = new Date();
    await queryInterface.bulkInsert('ticket_types', [
      {
        id: randomUUID(),
        type: 'adult',
        label: 'Adult Admission',
        price_etb: 100.0,
        description: 'Standard adult admission',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: 'student',
        label: 'Student / Youth',
        price_etb: 50.0,
        description: 'Valid student ID required',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: 'child',
        label: 'Child',
        price_etb: 30.0,
        description: 'Ages 5–12',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: 'group',
        label: 'School / Delegations',
        price_etb: 80.0,
        description: 'Per person rate for groups of 10+',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: 'vip',
        label: 'VIP Guided Tour',
        price_etb: 500.0,
        description: 'All-access exhibition entry + dedicated curator guided tour',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ticket_types');
  },
};

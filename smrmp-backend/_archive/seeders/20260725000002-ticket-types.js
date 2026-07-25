'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('ticket_types', [
      {
        id: uuidv4(),
        type: 'adult',
        label: 'Adult',
        price_etb: 100.0,
        description: 'Standard adult admission',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        type: 'student',
        label: 'Student',
        price_etb: 50.0,
        description: 'Valid student ID required',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        type: 'child',
        label: 'Child',
        price_etb: 30.0,
        description: 'Ages 5–12',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        type: 'foreign_adult',
        label: 'Foreign Adult',
        price_etb: 300.0,
        description: 'International visitor adult admission',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        type: 'foreign_student',
        label: 'Foreign Student',
        price_etb: 150.0,
        description: 'International student admission',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        type: 'group',
        label: 'Group',
        price_etb: 80.0,
        description: 'Per person rate for groups of 10+',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ticket_types', null, {});
  },
};

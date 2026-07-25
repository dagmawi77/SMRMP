'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('Demo@2026!', 12);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Museum Admin',
        email: 'admin@adwa.museum',
        password,
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Lead Curator',
        email: 'curator@adwa.museum',
        password,
        role: 'curator',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Conservation Officer',
        email: 'conservation@adwa.museum',
        password,
        role: 'conservation',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: [
        'admin@adwa.museum',
        'curator@adwa.museum',
        'conservation@adwa.museum',
      ],
    });
  },
};

'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Inserts staff profiles only. Passwords are created in Supabase Auth by:
 *   npm run auth:sync
 *
 * Note: Supabase Auth rejects some TLDs (including .museum), so demo emails
 * use @smrmp.dev.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Museum Admin',
        email: 'admin@smrmp.dev',
        password: null,
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Lead Curator',
        email: 'curator@smrmp.dev',
        password: null,
        role: 'curator',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Conservation Officer',
        email: 'conservation@smrmp.dev',
        password: null,
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
        'admin@smrmp.dev',
        'curator@smrmp.dev',
        'conservation@smrmp.dev',
        // legacy seed emails
        'admin@adwa.museum',
        'curator@adwa.museum',
        'conservation@adwa.museum',
      ],
    });
  },
};

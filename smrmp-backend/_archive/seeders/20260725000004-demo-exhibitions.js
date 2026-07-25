'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'curator@adwa.museum' LIMIT 1;`
    );
    const [artifacts] = await queryInterface.sequelize.query(
      `SELECT id FROM artifacts WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 12;`
    );
    const curatorId = users[0]?.id || null;
    const now = new Date();

    const exhibitions = [
      {
        id: uuidv4(),
        name: 'Voices of Adwa',
        description: 'Core gallery featuring arms and personal effects from the 1896 campaign.',
        status: 'active',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        location: 'Main Gallery',
        created_by: curatorId,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Textiles of Resistance',
        description: 'Textiles and ceremonial dress linked to the Adwa era.',
        status: 'active',
        start_date: '2026-03-01',
        end_date: '2026-09-30',
        location: 'Hall B',
        created_by: curatorId,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Archives of Memory',
        description: 'Documents and photographs from the memorial archive.',
        status: 'upcoming',
        start_date: '2026-08-01',
        end_date: '2026-11-30',
        location: 'Archive Room',
        created_by: curatorId,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('exhibitions', exhibitions);

    const links = [];
    exhibitions.forEach((ex, exIndex) => {
      const slice = artifacts.slice(exIndex * 4, exIndex * 4 + 4);
      slice.forEach((art, i) => {
        links.push({
          id: uuidv4(),
          exhibition_id: ex.id,
          artifact_id: art.id,
          display_order: i,
          created_at: now,
          updated_at: now,
        });
      });
    });

    if (links.length) {
      await queryInterface.bulkInsert('exhibition_artifacts', links);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('exhibition_artifacts', null, {});
    await queryInterface.bulkDelete('exhibitions', null, {});
  },
};

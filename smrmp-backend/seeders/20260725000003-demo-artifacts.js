'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'curator@smrmp.dev' LIMIT 1;`
    );
    const curatorId = users[0]?.id || null;
    const now = new Date();

    const samples = [
      ['Emperor Menelik II Shield', 'weapon', 'Adwa Campaign 1896', 'Ethiopia', 'Leather, wood, metal', 'Hall A', 'good'],
      ['Ras Alula Spear', 'weapon', 'Late 19th century', 'Tigray', 'Iron, wood', 'Hall A', 'fair'],
      ['Traditional Cotton Shamma', 'textile', '19th century', 'Northern Ethiopia', 'Cotton', 'Hall B', 'good'],
      ['Battle of Adwa Map', 'document', '1896', 'Ethiopia', 'Paper, ink', 'Archive Room', 'excellent'],
      ['Ceremonial Clay Pot', 'ceramic', 'Late 19th century', 'Shewa', 'Clay', 'Hall C', 'good'],
      ['Silver Cross Pendant', 'jewelry', '19th century', 'Lalibela region', 'Silver', 'Hall B', 'excellent'],
      ['Victory Drum', 'ceremonial', 'Adwa era', 'Ethiopia', 'Wood, hide', 'Hall A', 'fair'],
      ['Historic Photograph — Adwa Veterans', 'photograph', '1897', 'Addis Ababa', 'Photographic paper', 'Archive Room', 'poor'],
      ['Maria Theresa Thaler', 'coin', '18th–19th century', 'Ethiopia trade routes', 'Silver', 'Vault', 'good'],
      ['Officer Uniform Fragment', 'textile', '1896', 'Ethiopia', 'Wool, cotton', 'Hall B', 'critical'],
      ['Horn Drinking Cup', 'ceremonial', '19th century', 'Amhara', 'Animal horn', 'Hall C', 'good'],
      ['Inkstand of Court Scribe', 'other', 'Menelik era', 'Addis Ababa', 'Brass', 'Hall C', 'excellent'],
      ['Leather Cartridge Belt', 'weapon', 'Adwa Campaign', 'Ethiopia', 'Leather, metal', 'Hall A', 'fair'],
      ['Embroidered Cap', 'textile', 'Late 19th century', 'Harar', 'Cloth, thread', 'Hall B', 'good'],
      ['Treaty Draft Fragment', 'document', '1889–1896', 'Ethiopia', 'Paper', 'Archive Room', 'poor'],
      ['Beaded Necklace', 'jewelry', '19th century', 'Southern Ethiopia', 'Glass beads', 'Hall B', 'good'],
      ['Processional Cross', 'ceremonial', '19th century', 'Gondar', 'Brass', 'Hall C', 'excellent'],
      ['Field Telescope', 'other', 'Adwa Campaign', 'Imported', 'Brass, glass', 'Hall A', 'fair'],
      ['Campaign Water Flask', 'other', '1896', 'Ethiopia', 'Leather', 'Hall A', 'good'],
      ['Commemorative Medal', 'coin', 'Post-Adwa', 'Ethiopia', 'Bronze', 'Vault', 'excellent'],
    ];

    const artifacts = samples.map((row, index) => ({
      id: uuidv4(),
      name: row[0],
      category: row[1],
      historical_period: row[2],
      origin: row[3],
      materials: row[4],
      description: `${row[0]} associated with the Adwa Victory Memorial collection.`,
      description_source: 'manual',
      location: row[5],
      condition_status: row[6],
      qr_code: `ART-SEED${String(index + 1).padStart(3, '0')}`,
      keywords: `{${row[1]},adwa,ethiopia}`,
      is_on_loan: false,
      created_by: curatorId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }));

    await queryInterface.bulkInsert('artifacts', artifacts);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('artifacts', {
      qr_code: Array.from({ length: 20 }, (_, i) => `ART-SEED${String(i + 1).padStart(3, '0')}`),
    });
  },
};

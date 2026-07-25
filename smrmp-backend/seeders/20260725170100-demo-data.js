'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function makeQrCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ART-${suffix}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + (n % 8), 15, 0, 0);
  return d;
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Demo@2026!', 12);

    const adminId = uuidv4();
    const curatorId = uuidv4();
    const conservationId = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        name: 'Dawit Haile',
        email: 'admin@adwa.museum',
        password: passwordHash,
        role: 'admin',
        museum_id: null,
        is_active: true,
        last_login: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: curatorId,
        name: 'Tigist Bekele',
        email: 'curator@adwa.museum',
        password: passwordHash,
        role: 'curator',
        museum_id: null,
        is_active: true,
        last_login: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: conservationId,
        name: 'Selamawit Tesfaye',
        email: 'conservation@adwa.museum',
        password: passwordHash,
        role: 'conservation',
        museum_id: null,
        is_active: true,
        last_login: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    const artifactDefs = [
      {
        name: 'Ethiopian Battle Shield (Gasha)',
        category: 'weapon',
        historical_period: '1896',
        origin: 'Tigray Region, Ethiopia',
        condition_status: 'good',
        location: 'Gallery A',
        materials: 'Leather, wood, metal',
      },
      {
        name: 'Emperor Menelik II Portrait Painting',
        category: 'photograph',
        historical_period: '1896',
        origin: 'Addis Ababa',
        condition_status: 'excellent',
        location: 'Main Hall',
        materials: 'Paint, canvas',
      },
      {
        name: 'Traditional Ethiopian War Drum (Negarit)',
        category: 'ceremonial',
        historical_period: 'Late 19th Century',
        origin: 'Amhara Region',
        condition_status: 'fair',
        location: 'Gallery B',
        materials: 'Wood, hide',
      },
      {
        name: 'Adwa Victory Commemorative Medal',
        category: 'coin',
        historical_period: '1896',
        origin: 'Ethiopia',
        condition_status: 'excellent',
        location: 'Display Case 1',
        materials: 'Bronze',
      },
      {
        name: 'Ethiopian Orthodox Cross (Processional)',
        category: 'ceremonial',
        historical_period: '19th Century',
        origin: 'Lalibela, Ethiopia',
        condition_status: 'good',
        location: 'Gallery C',
        materials: 'Brass',
      },
      {
        name: 'Hand-woven Battle Flag (Dejazmach Unit)',
        category: 'textile',
        historical_period: '1896',
        origin: 'Northern Ethiopia',
        condition_status: 'poor',
        location: 'Conservation Lab',
        materials: 'Cotton, dye',
      },
      {
        name: 'Italian Campaign Map (Captured Document)',
        category: 'document',
        historical_period: '1895-1896',
        origin: 'Italy/Ethiopia',
        condition_status: 'fair',
        location: 'Archive Room',
        materials: 'Paper, ink',
      },
      {
        name: 'Traditional Ethiopian Sword (Shotel)',
        category: 'weapon',
        historical_period: '19th Century',
        origin: 'Gondar Region',
        condition_status: 'good',
        location: 'Gallery A',
        materials: 'Iron, leather',
      },
      {
        name: 'Empress Taytu Betul Commemorative Coin',
        category: 'coin',
        historical_period: '1896',
        origin: 'Ethiopia',
        condition_status: 'excellent',
        location: 'Display Case 1',
        materials: 'Silver',
      },
      {
        name: 'Ethiopian Warrior Ceremonial Robe',
        category: 'textile',
        historical_period: 'Late 19th Century',
        origin: 'Amhara Region',
        condition_status: 'fair',
        location: 'Gallery B',
        materials: 'Cloth, embroidery',
      },
      {
        name: 'Battle of Adwa Official Proclamation Letter',
        category: 'document',
        historical_period: 'March 1896',
        origin: 'Addis Ababa',
        condition_status: 'poor',
        location: 'Conservation Lab',
        materials: 'Paper, ink',
      },
      {
        name: 'Traditional Clay Water Vessel (Campaign Use)',
        category: 'ceramic',
        historical_period: '1896',
        origin: 'Oromia Region',
        condition_status: 'good',
        location: 'Gallery B',
        materials: 'Clay',
      },
      {
        name: 'Dejazmach Balcha Safo Portrait',
        category: 'photograph',
        historical_period: '1896',
        origin: 'Addis Ababa',
        condition_status: 'good',
        location: 'Gallery C',
        materials: 'Photographic paper',
      },
      {
        name: 'Ethiopian Silver Ceremonial Jewelry Set',
        category: 'jewelry',
        historical_period: '19th Century',
        origin: 'Harrar, Ethiopia',
        condition_status: 'excellent',
        location: 'Display Case 2',
        materials: 'Silver',
      },
      {
        name: 'Italian Rifle (War Trophy, Battle of Adwa)',
        category: 'weapon',
        historical_period: '1896',
        origin: 'Italy (captured)',
        condition_status: 'fair',
        location: 'Gallery A',
        materials: 'Steel, wood',
      },
    ];

    const artifactRows = artifactDefs.map((item) => {
      const qr = makeQrCode();
      return {
        id: uuidv4(),
        name: item.name,
        category: item.category,
        historical_period: item.historical_period,
        origin: item.origin,
        materials: item.materials,
        description: `${item.name} from the Adwa Victory Memorial collection.`,
        ai_description: null,
        description_source: 'manual',
        location: item.location,
        condition_status: item.condition_status,
        qr_code: qr,
        keywords: [item.category, 'adwa', 'ethiopia'],
        is_on_loan: false,
        created_by: curatorId,
        last_edited_by: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
    });

    await queryInterface.bulkInsert('artifacts', artifactRows);

    const exhibitionRows = [
      {
        id: uuidv4(),
        name: 'The Battle of Adwa: 1896',
        description: 'Core exhibition on the 1896 victory and its legacy.',
        theme: 'Adwa Victory',
        gallery: 'Main Hall',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        status: 'active',
        expected_visitors: 50000,
        actual_visitors: 12000,
        created_by: curatorId,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Warriors and Weapons of Ethiopia',
        description: 'Arms, shields, and campaign equipment of Ethiopian forces.',
        theme: 'Military Heritage',
        gallery: 'Gallery A',
        start_date: '2026-03-01',
        end_date: '2026-09-30',
        status: 'active',
        expected_visitors: 20000,
        actual_visitors: 4500,
        created_by: curatorId,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Ethiopian Heritage Collection',
        description: 'Upcoming showcase of textiles, jewelry, and ceremonial objects.',
        theme: 'Cultural Heritage',
        gallery: 'Gallery B',
        start_date: '2026-08-01',
        end_date: '2027-01-31',
        status: 'planning',
        expected_visitors: 15000,
        actual_visitors: null,
        created_by: curatorId,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('exhibitions', exhibitionRows);

    const ticketTypes = [
      { type: 'adult', price: 100 },
      { type: 'student', price: 50 },
      { type: 'child', price: 30 },
      { type: 'group', price: 80 },
      { type: 'vip', price: 500 },
    ];

    const ticketRows = [];
    for (let day = 0; day < 30; day += 1) {
      const created = daysAgo(day);
      const ticketMeta = ticketTypes[day % ticketTypes.length];
      const quantity = ticketMeta.type === 'group' ? 10 : 1 + (day % 3);

      ticketRows.push({
        id: uuidv4(),
        ticket_type: ticketMeta.type,
        visitor_name: `Visitor ${day + 1}`,
        visitor_email: `visitor${day + 1}@example.com`,
        visitor_phone: `+25191${String(1000000 + day).slice(-7)}`,
        quantity,
        unit_price: ticketMeta.price,
        total_amount: ticketMeta.price * quantity,
        payment_method: day % 2 === 0 ? 'telebirr' : 'cash',
        payment_status: 'completed',
        payment_reference: `DEMO-SEED-${day}`,
        qr_ticket_code: `TKT-SEED${String(day).padStart(2, '0')}${uuidv4()
          .slice(0, 4)
          .toUpperCase()}`,
        status: 'valid',
        visit_date: toDateOnly(created),
        used_at: null,
        is_sandbox: true,
        created_at: created,
        updated_at: created,
      });
    }

    await queryInterface.bulkInsert('tickets', ticketRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('exhibitions', null, {});
    await queryInterface.sequelize.query(
      `DELETE FROM artifacts WHERE qr_code LIKE 'ART-%'`
    );
    await queryInterface.bulkDelete('users', {
      email: [
        'admin@adwa.museum',
        'curator@adwa.museum',
        'conservation@adwa.museum',
      ],
    });
  },
};

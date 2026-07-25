'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const tickets = [];
    const types = ['adult', 'student', 'child', 'foreign_adult', 'group'];
    const prices = {
      adult: 100,
      student: 50,
      child: 30,
      foreign_adult: 300,
      group: 80,
    };

    for (let day = 29; day >= 0; day -= 1) {
      const created = new Date();
      created.setDate(created.getDate() - day);
      created.setHours(10 + (day % 6), 15, 0, 0);

      const countToday = 2 + (day % 4);
      for (let i = 0; i < countToday; i += 1) {
        const type = types[(day + i) % types.length];
        const quantity = type === 'group' ? 10 : 1 + (i % 3);
        tickets.push({
          id: uuidv4(),
          qr_ticket_code: `TKT-SEED${day}${i}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          ticket_type: type,
          quantity,
          unit_price: prices[type],
          total_amount: prices[type] * quantity,
          visitor_name: `Visitor ${day}-${i}`,
          visitor_phone: `+2519${String(10000000 + day * 10 + i).slice(0, 8)}`,
          visit_date: created.toISOString().slice(0, 10),
          payment_method: 'telebirr',
          payment_status: 'completed',
          payment_reference: `DEMO-SEED-${day}-${i}`,
          status: day === 0 && i === 0 ? 'valid' : 'used',
          used_at: day === 0 && i === 0 ? null : created,
          created_at: created,
          updated_at: created,
        });
      }
    }

    await queryInterface.bulkInsert('tickets', tickets);

    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'conservation@adwa.museum' LIMIT 1;`
    );
    const [artifacts] = await queryInterface.sequelize.query(
      `SELECT id, condition_status FROM artifacts WHERE condition_status IN ('poor', 'critical', 'fair') LIMIT 5;`
    );
    const inspectorId = users[0]?.id || null;

    if (artifacts.length) {
      const logs = artifacts.map((art) => ({
        id: uuidv4(),
        artifact_id: art.id,
        inspector_id: inspectorId,
        condition_before: art.condition_status,
        condition_after: art.condition_status,
        observations: 'Routine inspection during demo seed.',
        action_taken: 'Documented condition; monitoring scheduled.',
        next_inspection_date: '2026-08-15',
        requires_restoration: ['poor', 'critical'].includes(art.condition_status),
        inspected_at: now,
        created_at: now,
        updated_at: now,
      }));
      await queryInterface.bulkInsert('conservation_logs', logs);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('conservation_logs', null, {});
    await queryInterface.bulkDelete('tickets', null, {});
  },
};

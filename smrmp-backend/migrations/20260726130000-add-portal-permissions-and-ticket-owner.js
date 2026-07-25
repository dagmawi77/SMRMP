'use strict';

const { randomUUID } = require('crypto');
const { PERMISSIONS, ROLE_PERMISSION_MAP } = require('../src/config/rbacCatalog');

const PORTAL_CODES = [
  'portal.read',
  'portal.profile',
  'portal.memberships',
  'portal.tickets',
  'portal.visits',
  'portal.bookings',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const [existingPerms] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions`
    );
    const permIdByCode = Object.fromEntries(
      (existingPerms || []).map((p) => [p.code, p.id])
    );
    const catalogByCode = Object.fromEntries(PERMISSIONS.map((p) => [p.code, p]));

    for (const code of PORTAL_CODES) {
      if (permIdByCode[code]) continue;
      const meta = catalogByCode[code];
      if (!meta) continue;
      const id = randomUUID();
      await queryInterface.sequelize.query(
        `INSERT INTO permissions (id, code, module, description, created_at, updated_at)
         VALUES (:id, :code, :module, :description, :now, :now)
         ON CONFLICT (code) DO NOTHING`,
        {
          replacements: {
            id,
            code: meta.code,
            module: meta.module,
            description: meta.description,
            now,
          },
        }
      );
      permIdByCode[code] = id;
    }

    // Refresh permission ids after inserts
    const [allPerms] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions WHERE code LIKE 'portal.%'`
    );
    for (const row of allPerms || []) {
      permIdByCode[row.code] = row.id;
    }

    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles WHERE slug IN ('visitor', 'admin')`
    );
    const roleIdBySlug = Object.fromEntries((roles || []).map((r) => [r.slug, r.id]));

    for (const slug of ['visitor', 'admin']) {
      const roleId = roleIdBySlug[slug];
      if (!roleId) continue;
      const codes = ROLE_PERMISSION_MAP[slug] || [];
      for (const code of PORTAL_CODES) {
        if (!codes.includes(code) && slug !== 'admin') continue;
        const permissionId = permIdByCode[code];
        if (!permissionId) continue;
        await queryInterface.sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at)
           VALUES (:roleId, :permissionId, :now)
           ON CONFLICT (role_id, permission_id) DO NOTHING`,
          { replacements: { roleId, permissionId, now } }
        );
      }
      // Admin gets all portal codes via ROLE_PERMISSION_MAP which maps to all PERMISSIONS
      if (slug === 'admin') {
        for (const code of PORTAL_CODES) {
          const permissionId = permIdByCode[code];
          if (!permissionId) continue;
          await queryInterface.sequelize.query(
            `INSERT INTO role_permissions (role_id, permission_id, created_at)
             VALUES (:roleId, :permissionId, :now)
             ON CONFLICT (role_id, permission_id) DO NOTHING`,
            { replacements: { roleId, permissionId, now } }
          );
        }
      }
    }

    // Optional ownership column for ticket ↔ user link (additive, nullable)
    const ticketTable = await queryInterface.describeTable('tickets');
    if (!ticketTable.purchased_by_user_id) {
      await queryInterface.addColumn('tickets', 'purchased_by_user_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS "tickets_purchased_by_user_id" ON "tickets" ("purchased_by_user_id")`
      );
    }
  },

  async down(queryInterface) {
    const ticketTable = await queryInterface.describeTable('tickets');
    if (ticketTable.purchased_by_user_id) {
      await queryInterface.removeColumn('tickets', 'purchased_by_user_id');
    }

    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions WHERE permission_id IN (
         SELECT id FROM permissions WHERE code LIKE 'portal.%'
       )`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE code LIKE 'portal.%'`
    );
  },
};

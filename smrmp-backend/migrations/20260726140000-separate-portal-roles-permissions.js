'use strict';

/**
 * Separate portal ownership:
 * - Admin loses portal.* and Visitor Relations ops (visitors/members/bookings/feedback)
 * - Conservation/maintenance lose Module 8 CRM grants
 * - Curator retains Visitor Relations
 * - Visitor retains portal.* only
 */

const { QueryTypes } = require('sequelize');
const { ROLE_PERMISSION_MAP } = require('../src/config/rbacCatalog');

const EXCLUDED_FROM_ADMIN = [
  'portal.%',
  'visitors.%',
  'members.%',
  'bookings.%',
  'feedback.%',
];

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    // Revoke excluded modules from admin
    for (const pattern of EXCLUDED_FROM_ADMIN) {
      await sequelize.query(
        `DELETE FROM role_permissions
         WHERE role_id = (SELECT id FROM roles WHERE slug = 'admin' LIMIT 1)
           AND permission_id IN (
             SELECT id FROM permissions WHERE code LIKE :pattern
           )`,
        { replacements: { pattern } },
      );
    }

    // Strip Module 8 from conservation & maintenance
    for (const slug of ['conservation', 'maintenance']) {
      for (const pattern of ['visitors.%', 'members.%', 'bookings.%', 'feedback.%', 'portal.%']) {
        await sequelize.query(
          `DELETE FROM role_permissions
           WHERE role_id = (SELECT id FROM roles WHERE slug = :slug LIMIT 1)
             AND permission_id IN (
               SELECT id FROM permissions WHERE code LIKE :pattern
             )`,
          { replacements: { slug, pattern } },
        );
      }
    }

    // Ensure curator + visitor match catalog (insert missing only)
    for (const slug of ['curator', 'visitor', 'admin', 'conservation', 'maintenance']) {
      const codes = ROLE_PERMISSION_MAP[slug] || [];
      if (!codes.length) continue;

      const roleRows = await sequelize.query(
        `SELECT id FROM roles WHERE slug = :slug LIMIT 1`,
        { replacements: { slug }, type: QueryTypes.SELECT },
      );
      const roleId = roleRows[0]?.id;
      if (!roleId) continue;

      for (const code of codes) {
        const permRows = await sequelize.query(
          `SELECT id FROM permissions WHERE code = :code LIMIT 1`,
          { replacements: { code }, type: QueryTypes.SELECT },
        );
        const permissionId = permRows[0]?.id;
        if (!permissionId) continue;

        await sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at)
           SELECT :roleId, :permissionId, NOW()
           WHERE NOT EXISTS (
             SELECT 1 FROM role_permissions
             WHERE role_id = :roleId AND permission_id = :permissionId
           )`,
          { replacements: { roleId, permissionId } },
        );
      }
    }
  },

  async down(queryInterface) {
    // Non-destructive rollback: re-grant portal.* to admin only
    const sequelize = queryInterface.sequelize;
    const roleRows = await sequelize.query(
      `SELECT id FROM roles WHERE slug = 'admin' LIMIT 1`,
      { type: QueryTypes.SELECT },
    );
    const roleId = roleRows[0]?.id;
    if (!roleId) return;

    const portalPerms = await sequelize.query(
      `SELECT id FROM permissions WHERE code LIKE 'portal.%'`,
      { type: QueryTypes.SELECT },
    );

    for (const perm of portalPerms) {
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at)
         SELECT :roleId, :permissionId, NOW()
         WHERE NOT EXISTS (
           SELECT 1 FROM role_permissions
           WHERE role_id = :roleId AND permission_id = :permissionId
         )`,
        { replacements: { roleId, permissionId: perm.id } },
      );
    }
  },
};

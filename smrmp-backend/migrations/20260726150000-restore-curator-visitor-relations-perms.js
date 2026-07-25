'use strict';

/**
 * Restore orphan Visitor Relations permissions on curator so Curator Portal
 * CRM can complete bookings, manage tiers, and soft-delete/blacklist visitors.
 */

const { QueryTypes } = require('sequelize');

const CURATOR_EXTRA_PERMS = [
  'visitors.delete',
  'members.manage',
  'bookings.manage',
];

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const roleRows = await sequelize.query(
      `SELECT id FROM roles WHERE slug = 'curator' LIMIT 1`,
      { type: QueryTypes.SELECT },
    );
    const roleId = roleRows[0]?.id;
    if (!roleId) return;

    for (const code of CURATOR_EXTRA_PERMS) {
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
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    for (const code of CURATOR_EXTRA_PERMS) {
      await sequelize.query(
        `DELETE FROM role_permissions
         WHERE role_id = (SELECT id FROM roles WHERE slug = 'curator' LIMIT 1)
           AND permission_id = (SELECT id FROM permissions WHERE code = :code LIMIT 1)`,
        { replacements: { code } },
      );
    }
  },
};

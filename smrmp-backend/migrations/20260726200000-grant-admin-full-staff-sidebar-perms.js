'use strict';

/**
 * Grant Administrator full staff sidebar/ops permissions
 * (Visitor Relations: visitors, members, bookings, feedback).
 * Still excludes visitor self-service portal.*
 */

const { QueryTypes } = require('sequelize');

const ADMIN_STAFF_PREFIXES = [
  'visitors.%',
  'members.%',
  'bookings.%',
  'feedback.%',
];

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const [admin] = await sequelize.query(
      `SELECT id FROM roles WHERE slug = 'admin' LIMIT 1`,
      { type: QueryTypes.SELECT },
    );
    if (!admin?.id) return;

    for (const pattern of ADMIN_STAFF_PREFIXES) {
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT :roleId, p.id
         FROM permissions p
         WHERE p.code LIKE :pattern
           AND NOT EXISTS (
             SELECT 1 FROM role_permissions rp
             WHERE rp.role_id = :roleId AND rp.permission_id = p.id
           )`,
        { replacements: { roleId: admin.id, pattern } },
      );
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    for (const pattern of ADMIN_STAFF_PREFIXES) {
      await sequelize.query(
        `DELETE FROM role_permissions
         WHERE role_id = (SELECT id FROM roles WHERE slug = 'admin' LIMIT 1)
           AND permission_id IN (
             SELECT id FROM permissions WHERE code LIKE :pattern
           )`,
        { replacements: { pattern } },
      );
    }
  },
};

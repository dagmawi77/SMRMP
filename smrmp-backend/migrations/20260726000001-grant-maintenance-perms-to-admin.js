'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [adminRows] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE slug = 'admin' LIMIT 1`
    );
    if (!adminRows.length) return;

    const adminRoleId = adminRows[0].id;
    const [permRows] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE code IN ('maintenance.read', 'maintenance.update')`
    );

    for (const perm of permRows) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT role_id FROM role_permissions WHERE role_id = :roleId AND permission_id = :permissionId LIMIT 1`,
        { replacements: { roleId: adminRoleId, permissionId: perm.id } }
      );
      if (!existing.length) {
        await queryInterface.bulkInsert('role_permissions', [
          { role_id: adminRoleId, permission_id: perm.id },
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM role_permissions
       WHERE role_id = (SELECT id FROM roles WHERE slug = 'admin' LIMIT 1)
       AND permission_id IN (
         SELECT id FROM permissions WHERE code IN ('maintenance.read', 'maintenance.update')
       )`
    );
  },
};

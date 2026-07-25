'use strict';

const { randomUUID } = require('crypto');
const {
  SYSTEM_ROLES,
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
} = require('../src/config/rbacCatalog');

/**
 * Additive RBAC migration — inserts any Module 8 (visitors/members/bookings/
 * feedback) permissions and system-role grants that are missing on an
 * existing database, without touching pre-existing roles/permissions.
 */
const NEW_PERMISSION_CODES = [
  'visitors.read',
  'visitors.create',
  'visitors.update',
  'visitors.delete',
  'visitors.checkin',
  'members.read',
  'members.create',
  'members.update',
  'members.manage',
  'members.verify',
  'bookings.read',
  'bookings.update',
  'bookings.manage',
  'feedback.read',
  'feedback.update',
  'feedback.manage',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingRoles] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM roles`
    );
    const roleIdBySlug = Object.fromEntries(
      (existingRoles || []).map((r) => [r.slug, r.id])
    );

    // Ensure system roles exist (no-op if already present).
    for (const role of SYSTEM_ROLES) {
      if (roleIdBySlug[role.slug]) continue;
      const id = randomUUID();
      await queryInterface.sequelize.query(
        `INSERT INTO roles (id, slug, name, description, is_system, is_active, created_at, updated_at)
         VALUES (:id, :slug, :name, :description, true, true, :now, :now)
         ON CONFLICT (slug) DO NOTHING`,
        {
          replacements: {
            id,
            slug: role.slug,
            name: role.name,
            description: role.description,
            now,
          },
        }
      );
      roleIdBySlug[role.slug] = id;
    }

    const [existingPerms] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions`
    );
    const permIdByCode = Object.fromEntries(
      (existingPerms || []).map((p) => [p.code, p.id])
    );

    const permCatalogByCode = Object.fromEntries(
      PERMISSIONS.map((p) => [p.code, p])
    );

    for (const code of NEW_PERMISSION_CODES) {
      if (permIdByCode[code]) continue;
      const meta = permCatalogByCode[code];
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

    // Grant per ROLE_PERMISSION_MAP for system roles (only the new codes —
    // existing grants for other permissions are left untouched).
    for (const [slug, codes] of Object.entries(ROLE_PERMISSION_MAP)) {
      const roleId = roleIdBySlug[slug];
      if (!roleId) continue;
      for (const code of codes) {
        if (!NEW_PERMISSION_CODES.includes(code)) continue;
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

    // Admin always gets every permission (existing + new).
    const adminRoleId = roleIdBySlug.admin;
    if (adminRoleId) {
      const [allPerms] = await queryInterface.sequelize.query(
        `SELECT id FROM permissions`
      );
      for (const perm of allPerms || []) {
        await queryInterface.sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at)
           VALUES (:roleId, :permissionId, :now)
           ON CONFLICT (role_id, permission_id) DO NOTHING`,
          { replacements: { roleId: adminRoleId, permissionId: perm.id, now } }
        );
      }
    }
  },

  async down(queryInterface) {
    const [perms] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions WHERE code IN (:codes)`,
      { replacements: { codes: NEW_PERMISSION_CODES } }
    );
    const permIds = (perms || []).map((p) => p.id);
    if (permIds.length) {
      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions WHERE permission_id IN (:permIds)`,
        { replacements: { permIds } }
      );
      await queryInterface.sequelize.query(
        `DELETE FROM permissions WHERE id IN (:permIds)`,
        { replacements: { permIds } }
      );
    }
  },
};

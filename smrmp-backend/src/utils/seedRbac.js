/**
 * Seed RBAC catalog into an empty test DB (after sequelize.sync).
 */
const { Role, Permission, RolePermission } = require('../models');
const {
  SYSTEM_ROLES,
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
} = require('../config/rbacCatalog');

async function seedRbacForTests() {
  const roleBySlug = {};

  for (const role of SYSTEM_ROLES) {
    const [row] = await Role.findOrCreate({
      where: { slug: role.slug },
      defaults: {
        name: role.name,
        description: role.description,
        is_system: true,
        is_active: true,
      },
    });
    roleBySlug[role.slug] = row;
  }

  const permByCode = {};
  for (const perm of PERMISSIONS) {
    const [row] = await Permission.findOrCreate({
      where: { code: perm.code },
      defaults: {
        module: perm.module,
        description: perm.description,
      },
    });
    permByCode[perm.code] = row;
  }

  for (const [slug, codes] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = roleBySlug[slug];
    for (const code of codes) {
      const permission = permByCode[code];
      if (!role || !permission) continue;
      await RolePermission.findOrCreate({
        where: { role_id: role.id, permission_id: permission.id },
        defaults: {},
      });
    }
  }

  return roleBySlug;
}

module.exports = { seedRbacForTests };

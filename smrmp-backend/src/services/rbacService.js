/**
 * RBAC helpers — load role permissions and shape public user payloads.
 */
const { Role, Permission } = require('../models');

const ROLE_INCLUDE = {
  model: Role,
  as: 'rbacRole',
  attributes: ['id', 'slug', 'name', 'is_system', 'is_active'],
  include: [
    {
      model: Permission,
      as: 'permissions',
      attributes: ['id', 'code', 'module', 'description'],
      through: { attributes: [] },
    },
  ],
};

const getPermissionCodes = (user) => {
  const perms = user?.rbacRole?.permissions;
  if (!Array.isArray(perms)) return [];
  return perms.map((p) => p.code).filter(Boolean);
};

const toPublicUser = (user, permissionCodes) => {
  const codes = permissionCodes || getPermissionCodes(user);
  const slug = user.rbacRole?.slug || user.role || 'visitor';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    role: slug,
    role_id: user.role_id || user.rbacRole?.id || null,
    role_name: user.rbacRole?.name || slug,
    permissions: codes,
    must_change_password: Boolean(user.must_change_password),
    is_active: user.is_active,
  };
};

const findRoleBySlug = async (slug) =>
  Role.findOne({ where: { slug, is_active: true } });

module.exports = {
  ROLE_INCLUDE,
  getPermissionCodes,
  toPublicUser,
  findRoleBySlug,
};

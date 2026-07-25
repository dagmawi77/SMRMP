/**
 * RBAC helpers — load role permissions and shape public user payloads.
 */
const { User, Role, Permission } = require('../models');

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

/**
 * Repair accounts that still have legacy users.role but a null role_id.
 * Without role_id, permission checks always fail (empty permission set).
 */
const ensureRbacRoleLinked = async (user) => {
  if (!user) return user;
  if (user.rbacRole?.id || user.role_id) {
    if (!user.rbacRole && user.role_id) {
      return User.findByPk(user.id, { include: [ROLE_INCLUDE] });
    }
    return user;
  }

  const legacySlug = typeof user.role === 'string' ? user.role.trim() : '';
  if (!legacySlug) return user;

  const role = await Role.findOne({ where: { slug: legacySlug, is_active: true } });
  if (!role) return user;

  await user.update({ role_id: role.id });
  return User.findByPk(user.id, { include: [ROLE_INCLUDE] });
};

const toPublicUser = (user, permissionCodes) => {
  const codes = permissionCodes || getPermissionCodes(user);
  const slug = user.rbacRole?.slug || user.role || 'visitor';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    avatar: user.avatar || null,
    gender: user.gender || null,
    date_of_birth: user.date_of_birth || null,
    nationality: user.nationality || null,
    role: slug,
    role_id: user.role_id || user.rbacRole?.id || null,
    role_name: user.rbacRole?.name || slug,
    permissions: codes,
    must_change_password: Boolean(user.must_change_password),
    is_active: user.is_active,
    status: user.is_active === false ? 'inactive' : 'active',
    created_at: user.created_at || null,
    last_login: user.last_login || null,
  };
};

const findRoleBySlug = async (slug) =>
  Role.findOne({ where: { slug, is_active: true } });

module.exports = {
  ROLE_INCLUDE,
  getPermissionCodes,
  toPublicUser,
  findRoleBySlug,
  ensureRbacRoleLinked,
};

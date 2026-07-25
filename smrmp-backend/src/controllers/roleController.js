const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const { Role, Permission, RolePermission, User, sequelize } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');
const { ADMIN_PROTECTED_PERMISSIONS } = require('../config/rbacCatalog');

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);

const createRoleValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('slug').optional().trim().isLength({ min: 2, max: 50 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('permission_ids').optional().isArray(),
  validateRequest,
];

const updateRoleValidation = [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('is_active').optional().isBoolean(),
  validateRequest,
];

const assignPermissionsValidation = [
  param('id').isUUID(),
  body('permission_ids').isArray().withMessage('permission_ids must be an array'),
  validateRequest,
];

const rolePayload = (role) => ({
  id: role.id,
  slug: role.slug,
  name: role.name,
  description: role.description,
  is_system: role.is_system,
  is_active: role.is_active,
  permissions: (role.permissions || []).map((p) => ({
    id: p.id,
    code: p.code,
    module: p.module,
    description: p.description,
  })),
  permission_codes: (role.permissions || []).map((p) => p.code),
});

const listRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
      order: [
        ['is_system', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    return sendSuccess(res, 200, 'Roles retrieved', {
      roles: roles.map(rolePayload),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to list roles', error.message);
  }
};

const listPermissions = async (_req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [
        ['module', 'ASC'],
        ['code', 'ASC'],
      ],
    });
    return sendSuccess(res, 200, 'Permissions retrieved', { permissions });
  } catch (error) {
    return sendError(res, 500, 'Failed to list permissions', error.message);
  }
};

const createRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const name = String(req.body.name).trim();
    const slug = slugify(req.body.slug || name);
    if (!slug) {
      await transaction.rollback();
      return sendError(res, 400, 'Invalid role slug');
    }

    const existing = await Role.findOne({ where: { slug }, transaction });
    if (existing) {
      await transaction.rollback();
      return sendError(res, 409, 'A role with this slug already exists');
    }

    const role = await Role.create(
      {
        name,
        slug,
        description: req.body.description || null,
        is_system: false,
        is_active: true,
      },
      { transaction }
    );

    const permissionIds = Array.isArray(req.body.permission_ids)
      ? req.body.permission_ids
      : [];
    if (permissionIds.length) {
      const perms = await Permission.findAll({
        where: { id: { [Op.in]: permissionIds } },
        transaction,
      });
      if (perms.length !== permissionIds.length) {
        await transaction.rollback();
        return sendError(res, 400, 'One or more permission_ids are invalid');
      }
      await RolePermission.bulkCreate(
        perms.map((p) => ({ role_id: role.id, permission_id: p.id })),
        { transaction }
      );
    }

    await transaction.commit();

    const full = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    });

    await writeAuditLog({
      userId: req.user.id,
      action: 'CREATE_ROLE',
      tableName: 'roles',
      recordId: role.id,
      newValues: { slug, name, permission_ids: permissionIds },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Role created', { role: rolePayload(full) });
  } catch (error) {
    await transaction.rollback();
    return sendError(res, 500, 'Failed to create role', error.message);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return sendError(res, 404, 'Role not found');
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }
    if (req.body.is_active !== undefined) {
      if (role.is_system && req.body.is_active === false) {
        return sendError(res, 400, 'System roles cannot be deactivated');
      }
      updates.is_active = Boolean(req.body.is_active);
    }

    await role.update(updates);

    const full = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    });

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE_ROLE',
      tableName: 'roles',
      recordId: role.id,
      newValues: updates,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Role updated', { role: rolePayload(full) });
  } catch (error) {
    return sendError(res, 500, 'Failed to update role', error.message);
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return sendError(res, 404, 'Role not found');
    }
    if (role.is_system) {
      return sendError(res, 400, 'System roles cannot be deleted');
    }

    const assigned = await User.count({ where: { role_id: role.id } });
    if (assigned > 0) {
      return sendError(
        res,
        400,
        `Cannot delete role assigned to ${assigned} user(s). Reassign users first.`
      );
    }

    await role.destroy();

    await writeAuditLog({
      userId: req.user.id,
      action: 'DELETE_ROLE',
      tableName: 'roles',
      recordId: role.id,
      oldValues: { slug: role.slug, name: role.name },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Role deleted');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete role', error.message);
  }
};

const assignPermissions = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const role = await Role.findByPk(req.params.id, { transaction });
    if (!role) {
      await transaction.rollback();
      return sendError(res, 404, 'Role not found');
    }

    const permissionIds = req.body.permission_ids || [];
    let perms = [];
    if (permissionIds.length) {
      perms = await Permission.findAll({
        where: { id: { [Op.in]: permissionIds } },
        transaction,
      });
      if (perms.length !== permissionIds.length) {
        await transaction.rollback();
        return sendError(res, 400, 'One or more permission_ids are invalid');
      }
    }

    const codes = new Set(perms.map((p) => p.code));

    if (role.slug === 'admin') {
      const missing = ADMIN_PROTECTED_PERMISSIONS.filter((code) => !codes.has(code));
      if (missing.length) {
        await transaction.rollback();
        return sendError(
          res,
          400,
          `Admin role must retain protected permissions: ${missing.join(', ')}`
        );
      }
    }

    await RolePermission.destroy({ where: { role_id: role.id }, transaction });
    if (perms.length) {
      await RolePermission.bulkCreate(
        perms.map((p) => ({ role_id: role.id, permission_id: p.id })),
        { transaction }
      );
    }

    await transaction.commit();

    const full = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    });

    await writeAuditLog({
      userId: req.user.id,
      action: 'ASSIGN_ROLE_PERMISSIONS',
      tableName: 'roles',
      recordId: role.id,
      newValues: { permission_codes: [...codes] },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Role permissions updated', {
      role: rolePayload(full),
    });
  } catch (error) {
    await transaction.rollback();
    return sendError(res, 500, 'Failed to assign permissions', error.message);
  }
};

module.exports = {
  listRoles,
  listPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  createRoleValidation,
  updateRoleValidation,
  assignPermissionsValidation,
};

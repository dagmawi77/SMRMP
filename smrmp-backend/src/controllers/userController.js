const { body, param } = require('express-validator');
const { Op } = require('sequelize');
const { User, Role } = require('../models');
const { getSupabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');
const { paginate } = require('../utils/pagination');
const {
  ROLE_INCLUDE,
  toPublicUser,
  getPermissionCodes,
} = require('../services/rbacService');
const { STRONG_PASSWORD_RE } = require('./authController');

const STAFF_SLUGS = new Set([
  'admin',
  'curator',
  'conservation',
  'maintenance',
  'researcher',
]);

const createUserValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('email').isEmail().normalizeEmail(),
  body('role_id')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('role_id must be a valid UUID'),
  body('role')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('role must be a role slug'),
  body()
    .custom((payload) => Boolean(payload.role_id || payload.role))
    .withMessage('Either role_id (UUID) or role (slug) is required'),
  body('password')
    .optional({ values: 'falsy' })
    .matches(STRONG_PASSWORD_RE)
    .withMessage(
      'password must be at least 8 characters and include upper, lower, number, and special character'
    ),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 50 }),
  body('status').optional({ values: 'falsy' }).isIn(['active', 'inactive']),
  body('is_active').optional().isBoolean(),
  validateRequest,
];

const updateUserValidation = [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ min: 2, max: 255 }),
  body('role_id').optional().isUUID(),
  body('is_active').optional().isBoolean(),
  validateRequest,
];

const statusValidation = [
  param('id').isUUID(),
  body('is_active').isBoolean(),
  validateRequest,
];

const resolveTargetRole = async ({ roleId, roleSlug }) => {
  if (roleId) {
    return Role.findOne({ where: { id: roleId, is_active: true } });
  }
  return Role.findOne({
    where: { slug: String(roleSlug).trim().toLowerCase(), is_active: true },
  });
};

const getInviteRedirectUrl = () => {
  const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}/set-password`;
};

const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, is_active } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = String(is_active) === 'true';

    const paging = paginate(page, limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      include: [ROLE_INCLUDE],
      order: [['created_at', 'DESC']],
      ...paging,
    });

    return sendSuccess(res, 200, 'Users retrieved', {
      users: rows.map((u) => toPublicUser(u, getPermissionCodes(u))),
      pagination: {
        total: count,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: paging.limit,
        totalPages: Math.ceil(count / paging.limit) || 0,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to list users', error.message);
  }
};

const createStaffUser = async (req, res) => {
  let authUserId = null;

  try {
    const name = String(req.body.name).trim();
    const email = String(req.body.email).toLowerCase().trim();
    const { password, role_id: roleId, role: roleSlug } = req.body;
    const phone = req.body.phone ? String(req.body.phone).trim() : null;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists', {
        code: 'DUPLICATE_EMAIL',
      });
    }

    const role = await resolveTargetRole({ roleId, roleSlug });
    if (!role) {
      return sendError(res, 400, 'Invalid or inactive role');
    }
    if (role.slug === 'visitor') {
      return sendError(
        res,
        400,
        'Use public registration for visitor accounts. Staff create requires a staff role.'
      );
    }

    const isActive =
      req.body.is_active !== undefined
        ? Boolean(req.body.is_active)
        : req.body.status !== 'inactive';

    // No password supplied means this is an invitation: Supabase emails a magic
    // link and the recipient sets their own password on /set-password.
    const invited = !password;
    const userMetadata = { name, role: role.slug };
    const adminClient = getSupabaseAdmin();

    const { data: authData, error: authError } = invited
      ? await adminClient.auth.admin.inviteUserByEmail(email, {
          data: userMetadata,
          redirectTo: getInviteRedirectUrl(),
        })
      : await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: userMetadata,
          app_metadata: { role: role.slug },
        });

    if (authError || !authData?.user?.id) {
      const message = authError?.message || 'Unable to create authentication account.';
      if (/already|registered|exists/i.test(message)) {
        return sendError(res, 409, 'An account with this email already exists', {
          code: 'DUPLICATE_EMAIL',
        });
      }
      return sendError(res, 400, message);
    }

    authUserId = authData.user.id;

    if (invited) {
      // inviteUserByEmail cannot set app_metadata, so mirror the role claim after.
      const { error: metaError } = await adminClient.auth.admin.updateUserById(authUserId, {
        app_metadata: { role: role.slug },
      });
      if (metaError) {
        console.warn('[USERS] Could not set app_metadata role:', metaError.message);
      }
    }

    const user = await User.create({
      id: authUserId,
      name,
      email,
      phone,
      password: null,
      role: STAFF_SLUGS.has(role.slug) ? role.slug : 'curator',
      role_id: role.id,
      // Invitees pick their own password from the emailed link, so there is
      // nothing for them to rotate on first login.
      must_change_password: !invited,
      is_active: isActive,
    });

    const full = await User.findByPk(user.id, { include: [ROLE_INCLUDE] });

    await writeAuditLog({
      userId: req.user.id,
      action: invited ? 'INVITE_STAFF_USER' : 'CREATE_STAFF_USER',
      tableName: 'users',
      recordId: user.id,
      newValues: { email, role: role.slug, role_id: role.id, invited },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, invited ? 'Invitation sent' : 'Staff account created', {
      user: toPublicUser(full, getPermissionCodes(full)),
      invited,
      temporary_password: invited ? null : password,
      must_change_password: !invited,
    });
  } catch (error) {
    if (authUserId) {
      try {
        await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
      } catch (cleanupError) {
        console.error('[USERS] Failed to roll back Auth user:', cleanupError.message);
      }
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 409, 'An account with this email already exists', {
        code: 'DUPLICATE_EMAIL',
      });
    }
    return sendError(res, 500, 'Failed to create staff user', error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: [ROLE_INCLUDE] });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();

    if (req.body.role_id !== undefined) {
      if (!req.user.permissions?.includes('users.assign_role')) {
        return sendError(res, 403, 'Missing permission: users.assign_role');
      }
      const role = await Role.findOne({
        where: { id: req.body.role_id, is_active: true },
      });
      if (!role) {
        return sendError(res, 400, 'Invalid or inactive role');
      }
      updates.role_id = role.id;
      if (STAFF_SLUGS.has(role.slug) || role.slug === 'visitor') {
        updates.role = role.slug;
      }
    }

    if (req.body.is_active !== undefined) {
      if (!req.user.permissions?.includes('users.deactivate')) {
        return sendError(res, 403, 'Missing permission: users.deactivate');
      }
      updates.is_active = Boolean(req.body.is_active);
    }

    const before = { name: user.name, role_id: user.role_id, is_active: user.is_active };
    await user.update(updates);
    await user.reload({ include: [ROLE_INCLUDE] });

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE_USER',
      tableName: 'users',
      recordId: user.id,
      oldValues: before,
      newValues: updates,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'User updated', {
      user: toPublicUser(user, getPermissionCodes(user)),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update user', error.message);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: [ROLE_INCLUDE] });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.id === req.user.id && req.body.is_active === false) {
      return sendError(res, 400, 'You cannot deactivate your own account');
    }

    const before = user.is_active;
    await user.update({ is_active: Boolean(req.body.is_active) });

    await writeAuditLog({
      userId: req.user.id,
      action: 'UPDATE_USER_STATUS',
      tableName: 'users',
      recordId: user.id,
      oldValues: { is_active: before },
      newValues: { is_active: user.is_active },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'User status updated', {
      user: toPublicUser(user, getPermissionCodes(user)),
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update user status', error.message);
  }
};

module.exports = {
  listUsers,
  createStaffUser,
  updateUser,
  updateUserStatus,
  createUserValidation,
  updateUserValidation,
  statusValidation,
};

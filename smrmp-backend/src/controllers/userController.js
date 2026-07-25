const { body, query } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { getSupabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

/**
 * List staff users with search, role, status filtering, and pagination
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      status,
      excludeVisitors = 'true',
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    // Exclude visitors for staff management by default
    if (excludeVisitors === 'true' || excludeVisitors === true) {
      where.role = { [Op.ne]: 'visitor' };
    }

    if (role) {
      where.role = role;
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    if (search) {
      const q = `%${search.trim().toLowerCase()}%`;
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { name: { [Op.iLike]: q } },
            { email: { [Op.iLike]: q } },
            { phone: { [Op.iLike]: q } },
          ],
        },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset,
    });

    const formattedUsers = users.map((u) => {
      const plain = u.toJSON();
      return {
        ...plain,
        status: plain.is_active ? 'active' : 'inactive',
      };
    });

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      users: formattedUsers,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve users', error.message);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const plain = user.toJSON();
    return sendSuccess(res, 200, 'User retrieved successfully', {
      user: {
        ...plain,
        status: plain.is_active ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve user', error.message);
  }
};

/**
 * Validation rules for creating staff user
 */
const createUserValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role')
    .notEmpty()
    .isIn(['admin', 'curator', 'conservation', 'maintenance', 'researcher'])
    .withMessage('Role must be a valid staff role (visitor excluded)'),
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('department').optional().trim(),
  body('status').optional().isIn(['active', 'inactive']),
  validateRequest,
];

/**
 * Create a new staff user
 * POST /api/users
 */
const createUser = async (req, res) => {
  let authUserId = null;

  try {
    const { name, email, phone, role, password, status } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    if (role === 'visitor') {
      return sendError(res, 400, 'Visitor role cannot be created in staff management.');
    }

    const existing = await User.findOne({ where: { email: cleanEmail } });
    if (existing) {
      return sendError(res, 409, 'A user with this email address already exists.');
    }

    const isActive = status !== 'inactive';

    // Attempt Supabase Auth provisioning if credentials are present
    try {
      const admin = getSupabaseAdmin();
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { name, role },
        app_metadata: { role },
      });

      if (!authError && authData?.user?.id) {
        authUserId = authData.user.id;
      }
    } catch (supabaseErr) {
      console.warn('[USER] Supabase Admin provisioning skipped/failed:', supabaseErr.message);
    }

    const newUser = await User.create({
      id: authUserId || undefined,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      role,
      is_active: isActive,
    });

    await writeAuditLog({
      userId: req.user?.id || newUser.id,
      action: 'CREATE_USER',
      tableName: 'users',
      recordId: newUser.id,
      newValues: { name: newUser.name, email: newUser.email, role: newUser.role },
      ipAddress: req.ip,
    });

    const plain = newUser.toJSON();
    return sendSuccess(res, 201, 'Staff user created successfully', {
      user: {
        ...plain,
        status: plain.is_active ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    if (authUserId) {
      try {
        await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
      } catch (cleanupErr) {
        console.error('[USER] Failed to roll back Auth user:', cleanupErr.message);
      }
    }
    return sendError(res, 500, 'Failed to create user', error.message);
  }
};

/**
 * Validation rules for updating user
 */
const updateUserValidation = [
  body('name').optional().trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'curator', 'conservation', 'maintenance', 'researcher']),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }),
  body('phone').optional().trim(),
  body('status').optional().isIn(['active', 'inactive']),
  validateRequest,
];

/**
 * Update staff user
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (role === 'visitor') {
      return sendError(res, 400, 'Cannot set role to visitor in staff management.');
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const duplicate = await User.findOne({ where: { email: email.toLowerCase() } });
      if (duplicate) {
        return sendError(res, 409, 'A user with this email address already exists.');
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.toLowerCase().trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.is_active = status === 'active';

    const oldValues = { name: user.name, email: user.email, role: user.role, is_active: user.is_active };

    await user.update(updates);

    // Update password in Supabase Auth if provided and Admin is available
    if (password && password.trim()) {
      try {
        const admin = getSupabaseAdmin();
        await admin.auth.admin.updateUserById(id, { password: password.trim() });
      } catch (authErr) {
        console.warn('[USER] Supabase password update skipped:', authErr.message);
      }
    }

    await writeAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_USER',
      tableName: 'users',
      recordId: user.id,
      oldValues,
      newValues: updates,
      ipAddress: req.ip,
    });

    const plain = user.toJSON();
    return sendSuccess(res, 200, 'User updated successfully', {
      user: {
        ...plain,
        status: plain.is_active ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update user', error.message);
  }
};

/**
 * Toggle user active/inactive status
 * PATCH /api/users/:id/status
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      return sendError(res, 400, 'You cannot deactivate your own administrative account.');
    }

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    await writeAuditLog({
      userId: req.user?.id,
      action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      tableName: 'users',
      recordId: user.id,
      newValues: { is_active: newStatus },
      ipAddress: req.ip,
    });

    const plain = user.toJSON();
    return sendSuccess(res, 200, `User account set to ${newStatus ? 'active' : 'inactive'}`, {
      user: {
        ...plain,
        status: newStatus ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to toggle user status', error.message);
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      return sendError(res, 400, 'You cannot delete your own administrative account.');
    }

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const oldValues = { name: user.name, email: user.email, role: user.role };

    await user.destroy();

    // Try deleting from Supabase Auth if available
    try {
      const admin = getSupabaseAdmin();
      await admin.auth.admin.deleteUser(id);
    } catch (authErr) {
      console.warn('[USER] Supabase user deletion skipped:', authErr.message);
    }

    await writeAuditLog({
      userId: req.user?.id,
      action: 'DELETE_USER',
      tableName: 'users',
      recordId: id,
      oldValues,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'User account deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete user', error.message);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  createUserValidation,
  updateUserValidation,
};

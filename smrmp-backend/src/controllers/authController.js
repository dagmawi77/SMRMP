const { body } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { getSupabaseAuth } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  validateRequest,
];

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * Authenticate via Supabase Auth, then attach the local staff profile (roles).
 * Passwords live in auth.users — public.users is the app profile table.
 */
const login = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const { password } = req.body;

    const { data, error } = await getSupabaseAuth().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session?.access_token || !data?.user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const user = await User.findOne({
      where: {
        is_active: true,
        [Op.or]: [{ id: data.user.id }, { email }],
      },
    });

    if (!user) {
      return sendError(
        res,
        403,
        'This account is authenticated but has no active staff profile.',
      );
    }

    await user.update({ last_login: new Date() });

    await writeAuditLog({
      userId: user.id,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Login successful', {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: toPublicUser(user),
    });
  } catch (error) {
    return sendError(res, 500, 'Login failed', error.message);
  }
};

const logout = async (req, res) => {
  try {
    await writeAuditLog({
      userId: req.user.id,
      action: 'LOGOUT',
      tableName: 'users',
      recordId: req.user.id,
      ipAddress: req.ip,
    });
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 500, 'Logout failed', error.message);
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'User profile retrieved', {
    user: {
      ...toPublicUser(req.user),
      created_at: req.user.created_at,
    },
  });
};

module.exports = { login, logout, getMe, loginValidation };

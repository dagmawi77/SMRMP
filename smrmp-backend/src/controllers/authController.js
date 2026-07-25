const { body } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { getSupabaseAuth, getSupabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  validateRequest,
];

const registerValidation = [
  body('firstName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('lastName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('gender').trim().notEmpty().isIn(['male', 'female', 'other', 'prefer_not']),
  body('dateOfBirth').isISO8601({ strict: true }).toDate(),
  body('nationality').trim().notEmpty().isLength({ max: 100 }),
  body('nationalId')
    .trim()
    .notEmpty()
    .matches(/^[A-Za-z0-9-]{5,20}$/)
    .withMessage('nationalId must be 5–20 alphanumeric characters'),
  body('username')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('username may only contain letters, numbers, dots, underscores, hyphens'),
  body('email').isEmail().normalizeEmail(),
  body('mobilePhone')
    .trim()
    .notEmpty()
    .matches(/^[+]?[\d\s()-]{7,20}$/)
    .withMessage('mobilePhone must be a valid phone number'),
  body('password')
    .notEmpty()
    .matches(STRONG_PASSWORD_RE)
    .withMessage(
      'password must be at least 8 characters and include upper, lower, number, and special character',
    ),
  body('confirmPassword')
    .notEmpty()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  validateRequest,
];

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  username: user.username || null,
});

/**
 * Create a visitor account: Supabase Auth user + local public.users profile.
 * Role is always visitor — staff accounts are provisioned separately.
 */
const register = async (req, res) => {
  let authUserId = null;

  try {
    const email = req.body.email.toLowerCase();
    const username = req.body.username.trim().toLowerCase();
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const name = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
    const {
      password,
      gender,
      dateOfBirth,
      nationality,
      nationalId,
      mobilePhone,
    } = req.body;

    const existing = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existing) {
      if (existing.email === email) {
        return sendError(res, 409, 'An account with this email already exists', {
          code: 'DUPLICATE_EMAIL',
        });
      }
      return sendError(res, 409, 'This username is already taken', {
        code: 'DUPLICATE_USERNAME',
      });
    }

    const admin = getSupabaseAdmin();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'visitor',
        username,
      },
      app_metadata: { role: 'visitor' },
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

    const user = await User.create({
      id: authUserId,
      name,
      email,
      username,
      phone: String(mobilePhone).trim(),
      gender,
      date_of_birth: dateOfBirth,
      nationality: String(nationality).trim(),
      national_id: String(nationalId).trim(),
      password: null,
      role: 'visitor',
      is_active: true,
    });

    await writeAuditLog({
      userId: user.id,
      action: 'REGISTER',
      tableName: 'users',
      recordId: user.id,
      newValues: { email: user.email, username: user.username, role: user.role },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Visitor account created successfully', {
      user: toPublicUser(user),
    });
  } catch (error) {
    if (authUserId) {
      try {
        await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
      } catch (cleanupError) {
        console.error('[AUTH] Failed to roll back Auth user:', cleanupError.message);
      }
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors?.[0]?.path;
      if (field === 'username') {
        return sendError(res, 409, 'This username is already taken', {
          code: 'DUPLICATE_USERNAME',
        });
      }
      return sendError(res, 409, 'An account with this email already exists', {
        code: 'DUPLICATE_EMAIL',
      });
    }

    return sendError(res, 500, 'Registration failed', error.message);
  }
};

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

module.exports = {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation,
};

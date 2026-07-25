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
});

/**
 * Create a visitor account: Supabase Auth user + local public.users profile.
 * Role is always visitor — staff accounts are provisioned separately.
 */
const register = async (req, res) => {
  let authUserId = null;

  try {
    const email = req.body.email.toLowerCase();
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

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return sendError(res, 409, 'An account with this email already exists', {
        code: 'DUPLICATE_EMAIL',
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
      newValues: { email: user.email, role: user.role },
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

    // Overlap Auth RTT with the profile lookup (email match covers the common case).
    const [{ data, error }, userByEmail] = await Promise.all([
      getSupabaseAuth().auth.signInWithPassword({ email, password }),
      User.findOne({ where: { is_active: true, email } }),
    ]);

    if (error || !data?.session?.access_token || !data?.user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    let user = userByEmail && userByEmail.id === data.user.id ? userByEmail : null;

    if (!user) {
      user = await User.findOne({
        where: {
          is_active: true,
          [Op.or]: [{ id: data.user.id }, { email }],
        },
      });
    }

    if (!user) {
      return sendError(
        res,
        403,
        'This account is authenticated but has no active staff profile.',
      );
    }

    // Don't block the login response on bookkeeping writes.
    const ipAddress = req.ip;
    Promise.resolve()
      .then(() => user.update({ last_login: new Date() }))
      .then(() =>
        writeAuditLog({
          userId: user.id,
          action: 'LOGIN',
          tableName: 'users',
          recordId: user.id,
          ipAddress,
        }),
      )
      .catch((sideEffectError) => {
        console.error('[AUTH] Post-login side effects failed:', sideEffectError.message);
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

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required'),
  validateRequest,
];

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return sendSuccess(res, 200, 'If that email address is registered, a password reset link has been sent.');
    }

    const redirectUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/set-password`
      : 'http://localhost:3000/set-password';

    try {
      const { error } = await getSupabaseAuth().auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.warn('[AUTH] Supabase resetPasswordForEmail failed:', error.message);
      }
    } catch (supabaseErr) {
      console.warn('[AUTH] Supabase resetPasswordForEmail error:', supabaseErr.message);
    }

    await writeAuditLog({
      userId: user.id,
      action: 'REQUEST_PASSWORD_RESET',
      tableName: 'users',
      recordId: user.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'If that email address is registered, a password reset link has been sent.');
  } catch (error) {
    return sendError(res, 500, 'Failed to request password reset', error.message);
  }
};

const updatePasswordValidation = [
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest,
];

const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    try {
      const admin = getSupabaseAdmin();
      await admin.auth.admin.updateUserById(userId, { password });
    } catch (authErr) {
      console.warn('[AUTH] Supabase password update failed:', authErr.message);
    }

    await writeAuditLog({
      userId,
      action: 'UPDATE_PASSWORD',
      tableName: 'users',
      recordId: userId,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Password updated successfully');
  } catch (error) {
    return sendError(res, 500, 'Failed to update password', error.message);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  updatePassword,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  updatePasswordValidation,
};

const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { writeAuditLog } = require('../middleware/auditLogger');
const validateRequest = require('../middleware/validateRequest');

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  validateRequest,
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase(), is_active: true },
    });

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    await user.update({ last_login: new Date() });
    const token = signToken(user.id, user.role);

    await writeAuditLog({
      userId: user.id,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      created_at: req.user.created_at,
    },
  });
};

module.exports = { login, logout, getMe, loginValidation };

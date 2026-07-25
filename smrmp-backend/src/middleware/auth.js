const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { getSupabaseAuth } = require('../config/supabase');
const { sendError } = require('../utils/apiResponse');
const {
  ROLE_INCLUDE,
  getPermissionCodes,
  toPublicUser,
} = require('../services/rbacService');

/** Short-lived cache so burst API calls after login don't re-hit Supabase Auth. */
const authUserCache = new Map();
const AUTH_CACHE_TTL_MS = 60_000;
const AUTH_CACHE_MAX = 500;

const PASSWORD_CHANGE_ALLOWLIST = new Set([
  'GET /api/auth/me',
  'POST /api/auth/change-password',
  'POST /api/auth/logout',
]);

const cacheAuthUser = (token, authUser, expSeconds) => {
  const fromExp =
    typeof expSeconds === 'number' ? expSeconds * 1000 : Date.now() + AUTH_CACHE_TTL_MS;
  const expiresAt = Math.min(fromExp, Date.now() + AUTH_CACHE_TTL_MS);

  if (authUserCache.size >= AUTH_CACHE_MAX) {
    const oldest = authUserCache.keys().next().value;
    authUserCache.delete(oldest);
  }

  authUserCache.set(token, { authUser, expiresAt });
};

const getCachedAuthUser = (token) => {
  const cached = authUserCache.get(token);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    authUserCache.delete(token);
    return null;
  }
  return cached.authUser;
};

/**
 * Prefer local HS256 verify when SUPABASE_JWT_SECRET is set (no Auth API RTT).
 * Falls back to Supabase Auth getUser for opaque/test tokens or missing secret.
 */
const resolveAuthUser = async (token) => {
  const cached = getCachedAuthUser(token);
  if (cached) return cached;

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (secret) {
    try {
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
      if (payload?.sub) {
        const authUser = {
          id: payload.sub,
          email: typeof payload.email === 'string' ? payload.email : undefined,
        };
        cacheAuthUser(token, authUser, payload.exp);
        return authUser;
      }
    } catch {
      // Not a locally verifiable JWT — try Auth API.
    }
  }

  const { data, error } = await getSupabaseAuth().auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  cacheAuthUser(token, data.user);
  return data.user;
};

/**
 * Verifies a Supabase Auth access token, then loads the matching profile
 * with RBAC role + permissions attached to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required.');
    }

    const authUser = await resolveAuthUser(token);

    if (!authUser) {
      return sendError(res, 401, 'Invalid or expired authentication token.');
    }

    const email = authUser.email?.toLowerCase();

    const user = await User.findOne({
      where: {
        is_active: true,
        [Op.or]: [{ id: authUser.id }, ...(email ? [{ email }] : [])],
      },
      include: [ROLE_INCLUDE],
    });

    if (!user) {
      return sendError(res, 401, 'User not found or deactivated.');
    }

    const permissions = getPermissionCodes(user);
    const publicUser = toPublicUser(user, permissions);

    req.user = {
      ...user.get({ plain: true }),
      ...publicUser,
      permissions,
      rbacRole: user.rbacRole,
    };
    req.authUser = authUser;

    if (user.must_change_password) {
      const key = `${req.method} ${req.baseUrl}${req.path}`.replace(/\/$/, '') || `${req.method} ${req.originalUrl.split('?')[0]}`;
      const normalized = `${req.method} ${req.originalUrl.split('?')[0]}`;
      const allowed =
        PASSWORD_CHANGE_ALLOWLIST.has(normalized) ||
        PASSWORD_CHANGE_ALLOWLIST.has(key) ||
        (req.method === 'GET' && normalized.endsWith('/auth/me')) ||
        (req.method === 'POST' && normalized.endsWith('/auth/change-password')) ||
        (req.method === 'POST' && normalized.endsWith('/auth/logout'));

      if (!allowed) {
        return sendError(res, 403, 'Password change required before continuing.', {
          code: 'MUST_CHANGE_PASSWORD',
        });
      }
    }

    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

module.exports = { protect };

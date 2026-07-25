const { Op } = require('sequelize');
const { User } = require('../models');
const { getSupabaseAuth } = require('../config/supabase');
const { sendError } = require('../utils/apiResponse');

/**
 * Verifies a Supabase Auth access token, then loads the matching staff profile
 * from public.users (by auth user id, with email fallback during migration).
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

    const { data, error } = await getSupabaseAuth().auth.getUser(token);

    if (error || !data?.user) {
      return sendError(res, 401, 'Invalid or expired authentication token.');
    }

    const authUser = data.user;
    const email = authUser.email?.toLowerCase();

    const user = await User.findOne({
      where: {
        is_active: true,
        [Op.or]: [
          { id: authUser.id },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (!user) {
      return sendError(res, 401, 'User not found or deactivated.');
    }

    req.user = user;
    req.authUser = authUser;
    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

module.exports = { protect };

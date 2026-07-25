/** Jest manual mock for Supabase Auth used by API tests. */

const { randomUUID } = require('crypto');

const sessions = new Map();

function resetAuthMock() {
  sessions.clear();
}

function registerAuthUser({ id, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const token = `tok-${id}`;
  sessions.set(normalizedEmail, {
    password,
    user: { id, email: normalizedEmail },
    token,
  });
  return token;
}

const getSupabaseAuth = () => ({
  auth: {
    signInWithPassword: async ({ email, password }) => {
      const entry = sessions.get(String(email).toLowerCase());
      if (!entry || entry.password !== password) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        };
      }
      return {
        data: {
          user: entry.user,
          session: {
            access_token: entry.token,
            refresh_token: 'test-refresh',
            expires_at: 9999999999,
          },
        },
        error: null,
      };
    },
    getUser: async (token) => {
      for (const entry of sessions.values()) {
        if (entry.token === token) {
          return { data: { user: entry.user }, error: null };
        }
      }
      return { data: { user: null }, error: { message: 'invalid JWT' } };
    },
  },
});

const getSupabaseAdmin = () => ({
  auth: {
    admin: {
      createUser: async ({ email, password, id }) => {
        const normalizedEmail = String(email).toLowerCase();
        if (sessions.has(normalizedEmail)) {
          return {
            data: { user: null },
            error: { message: 'User already registered' },
          };
        }
        const userId = id || randomUUID();
        registerAuthUser({ id: userId, email: normalizedEmail, password });
        return {
          data: { user: { id: userId, email: normalizedEmail } },
          error: null,
        };
      },
      deleteUser: async (userId) => {
        for (const [email, entry] of sessions.entries()) {
          if (entry.user.id === userId) {
            sessions.delete(email);
            break;
          }
        }
        return { data: {}, error: null };
      },
    },
  },
});

module.exports = {
  getSupabaseAuth,
  getSupabaseAdmin,
  registerAuthUser,
  resetAuthMock,
};

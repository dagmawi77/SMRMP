/** Jest manual mock for Supabase Auth used by API tests. */

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

const getSupabaseAdmin = jest.fn();

module.exports = {
  getSupabaseAuth,
  getSupabaseAdmin,
  registerAuthUser,
  resetAuthMock,
};

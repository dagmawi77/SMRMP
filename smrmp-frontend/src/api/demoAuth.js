export const DEMO_PASSWORD = 'Demo@2026!';

export const DEMO_USERS = {
  'admin@adwa.museum': {
    id: 'demo-admin-id',
    name: 'Museum Admin',
    email: 'admin@adwa.museum',
    role: 'admin',
  },
  'curator@adwa.museum': {
    id: 'demo-curator-id',
    name: 'Lead Curator',
    email: 'curator@adwa.museum',
    role: 'curator',
  },
  'conservation@adwa.museum': {
    id: 'demo-conservation-id',
    name: 'Conservation Lead',
    email: 'conservation@adwa.museum',
    role: 'conservation',
  },
};

export function getDemoLoginResponse(credentials) {
  const email = credentials.email.trim().toLowerCase();
  const user = DEMO_USERS[email];

  if (!user || credentials.password !== DEMO_PASSWORD) {
    const error = new Error('Invalid email or password.');
    error.response = {
      data: { success: false, message: 'Invalid email or password.' },
    };
    throw error;
  }

  return {
    data: {
      success: true,
      message: 'Login successful (demo mode)',
      data: {
        token: `demo-token-${user.role}`,
        user,
      },
    },
  };
}

export function isBackendUnavailable(error) {
  return (
    !error.response
    && (error.code === 'ERR_NETWORK'
      || error.message === 'Network Error'
      || error.message?.includes('ECONNREFUSED'))
  );
}

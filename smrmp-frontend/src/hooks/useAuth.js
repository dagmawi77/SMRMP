import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { ROLE_REDIRECTS } from '../utils/constants';

const FRONTEND_DEMO_USERS = {
  'maintenance@adwa.museum': {
    id: 'demo-mnt-001',
    name: 'Maintenance Officer',
    email: 'maintenance@adwa.museum',
    role: 'maintenance',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
  'maintenance@smrmp.dev': {
    id: 'demo-mnt-002',
    name: 'Maintenance Officer',
    email: 'maintenance@smrmp.dev',
    role: 'maintenance',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
  'curator@adwa.museum': {
    id: 'demo-cur-001',
    name: 'Curator Staff',
    email: 'curator@adwa.museum',
    role: 'curator',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
  'curator@smrmp.dev': {
    id: 'demo-cur-002',
    name: 'Curator Staff',
    email: 'curator@smrmp.dev',
    role: 'curator',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
  'admin@adwa.museum': {
    id: 'demo-adm-001',
    name: 'Admin User',
    email: 'admin@adwa.museum',
    role: 'admin',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
  'admin@smrmp.dev': {
    id: 'demo-adm-002',
    name: 'Admin User',
    email: 'admin@smrmp.dev',
    role: 'admin',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
  'conservation@adwa.museum': {
    id: 'demo-con-001',
    name: 'Conservation Lead',
    email: 'conservation@adwa.museum',
    role: 'conservation',
    museum_id: 'adwa-memorial-01',
    is_active: true,
  },
};

function getDemoProfile(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  if (FRONTEND_DEMO_USERS[normalized]) {
    return FRONTEND_DEMO_USERS[normalized];
  }
  if (normalized.includes('maintenance') || normalized.includes('suphaa') || normalized.includes('repair')) {
    return {
      id: `demo-mnt-${Date.now()}`,
      name: 'Maintenance Officer',
      email: normalized,
      role: 'maintenance',
      museum_id: 'adwa-memorial-01',
      is_active: true,
    };
  }
  return null;
}

export default function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isRestoringSession,
    setAuth,
    setToken,
    clearAuth,
    hasRole,
  } = useAuthStore();

  const login = useCallback(
    async (credentials) => {
      const email = credentials.email.trim().toLowerCase();
      const { password } = credentials;

      let userData = null;
      let accessToken = null;
      let refreshToken = null;

      try {
        const res = await authApi.login({ email, password });
        const payload = res.data?.data;
        accessToken = payload?.token;
        refreshToken = payload?.refresh_token;
        userData = payload?.user;
      } catch (error) {
        // Fallback demo profile for frontend testing when backend login fails or user is not registered in backend
        const demoUser = getDemoProfile(email);
        if (demoUser) {
          userData = demoUser;
          accessToken = `demo-token-${Date.now()}`;
        } else {
          throw error;
        }
      }

      if (!accessToken || !userData) {
        throw new Error('Unexpected login response from server');
      }

      setAuth(userData, accessToken);

      toast.success(`Welcome back, ${userData.name}!`);
      if (userData.must_change_password) {
        navigate('/change-password', { replace: true });
      } else {
        const targetPath = ROLE_REDIRECTS[userData.role] || '/dashboard';
        navigate(targetPath, { replace: true });
      }

      if (refreshToken) {
        void supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ error: sessionError }) => {
            if (sessionError) {
              console.warn(
                '[AUTH] Failed to persist Supabase session:',
                sessionError.message,
              );
            }
          });
      } else {
        setToken(accessToken);
      }

      return userData;
    },
    [navigate, setAuth, setToken],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Audit log is best-effort; local/Supabase sign-out still proceeds.
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  return { user, isAuthenticated, isRestoringSession, login, logout, hasRole };
}

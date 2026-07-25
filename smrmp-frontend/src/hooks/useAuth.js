import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { ROLE_REDIRECTS } from '../utils/constants';

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

      // One API hop: backend signs in with Supabase and returns profile + tokens.
      // Avoids browser → Supabase Auth, then browser → /auth/me → Auth again.
      const res = await authApi.login({ email, password });
      const payload = res.data?.data;
      const accessToken = payload?.token;
      const refreshToken = payload?.refresh_token;
      const userData = payload?.user;

      if (!accessToken || !userData) {
        throw new Error('Unexpected login response from server');
      }

      // Hydrate app state before setSession so SIGNED_IN skips a duplicate /auth/me.
      setAuth(userData, accessToken);

      toast.success(`Welcome back, ${userData.name}!`);
      navigate(ROLE_REDIRECTS[userData.role] || '/dashboard', { replace: true });

      // Persist Supabase session in the background — don't delay the redirect.
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

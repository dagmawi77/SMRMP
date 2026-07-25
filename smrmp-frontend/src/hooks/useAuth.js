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

      // Supabase Auth owns the credential check + session tokens.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session?.access_token) {
        const err = new Error(error?.message || 'Invalid email or password.');
        err.code = error?.code;
        err.status = error?.status ?? 401;
        throw err;
      }

      const accessToken = data.session.access_token;
      // Make the token available to axios before /auth/me runs.
      setToken(accessToken);

      let userData;
      try {
        const res = await authApi.getMe();
        userData = res.data?.data?.user;
      } catch (profileError) {
        await supabase.auth.signOut();
        clearAuth();
        throw profileError;
      }

      if (!userData) {
        await supabase.auth.signOut();
        clearAuth();
        throw new Error('Unexpected login response from server');
      }

      setAuth(userData, accessToken);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(ROLE_REDIRECTS[userData.role] || '/dashboard', { replace: true });
      return userData;
    },
    [navigate, setAuth, setToken, clearAuth],
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

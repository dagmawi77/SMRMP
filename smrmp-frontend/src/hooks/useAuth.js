import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import useAuthStore from '../store/authStore';
import { ROLE_REDIRECTS } from '../utils/constants';

export default function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, clearAuth, hasRole } = useAuthStore();

  const login = useCallback(
    async (credentials) => {
      const res = await authApi.login(credentials);
      const payload = res.data?.data;

      if (!payload?.token || !payload?.user) {
        throw new Error('Unexpected login response from server');
      }

      const { token, user: userData } = payload;
      setAuth(userData, token);

      const isDemo = token.startsWith('demo-token-');
      toast.success(
        isDemo
          ? `Welcome, ${userData.name}! (demo mode — backend offline)`
          : `Welcome back, ${userData.name}!`,
      );
      navigate(ROLE_REDIRECTS[userData.role] || '/dashboard');
      return userData;
    },
    [navigate, setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return { user, isAuthenticated, login, logout, hasRole };
}

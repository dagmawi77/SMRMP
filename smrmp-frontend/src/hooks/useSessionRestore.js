import { useEffect } from 'react';
import { authApi } from '../api/authApi';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

/**
 * Restores the Supabase Auth session on boot, revalidates the staff profile
 * via /auth/me, and keeps the axios Bearer token in sync when Auth refreshes.
 */
export default function useSessionRestore() {
  useEffect(() => {
    let cancelled = false;
    const { setAuth, clearAuth, finishRestoringSession, setToken } =
      useAuthStore.getState();

    const hydrateFromSession = async (session) => {
      if (!session?.access_token) {
        clearAuth();
        return;
      }

      setToken(session.access_token);

      try {
        const res = await authApi.getMe();
        if (cancelled) return;
        const currentUser = res.data?.data?.user;
        if (currentUser) {
          setAuth(currentUser, session.access_token);
        } else {
          clearAuth();
          await supabase.auth.signOut();
        }
      } catch (error) {
        if (cancelled) return;
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
          await supabase.auth.signOut();
        }
      }
    };

    const boot = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          await hydrateFromSession(data.session);
        } else {
          const { user, token } = useAuthStore.getState();
          if (token && token.startsWith('demo-token-') && user) {
            // Keep local frontend demo auth session
          } else {
            clearAuth();
          }
        }
      } finally {
        if (!cancelled) finishRestoringSession();
      }
    };

    boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === 'SIGNED_OUT' || !session) {
        clearAuth();
        return;
      }

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setToken(session.access_token);
        // Login already hydrates via /auth/login; only fetch profile when missing.
        const { user, isAuthenticated } = useAuthStore.getState();
        if (event === 'SIGNED_IN' && !user && !isAuthenticated) {
          await hydrateFromSession(session);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
}

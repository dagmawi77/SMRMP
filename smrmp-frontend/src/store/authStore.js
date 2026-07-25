import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      // Not persisted, so every page load re-verifies the stored token against
      // /auth/me before protected routes are allowed to render.
      isRestoringSession: true,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(token && user),
        }),

      setToken: (token) =>
        set((state) => ({
          token,
          isAuthenticated: Boolean(token && state.user),
        })),

      clearAuth: () => {
        // Older builds mirrored the session into standalone keys.
        localStorage.removeItem('smrmp_token');
        localStorage.removeItem('smrmp_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      finishRestoringSession: () => set({ isRestoringSession: false }),

      hasRole: (...roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'smrmp_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isRestoringSession: true,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(token && user),
        }),

      updateUser: (partialUser) =>
        set((state) => {
          const updatedUser = state.user
            ? { ...state.user, ...partialUser }
            : partialUser;
          if (updatedUser) {
            localStorage.setItem('smrmp_user', JSON.stringify(updatedUser));
          }
          return { user: updatedUser };
        }),

      setToken: (token) =>
        set((state) => ({
          token,
          isAuthenticated: Boolean(token && state.user),
        })),

      clearAuth: () => {
        localStorage.removeItem('smrmp_token');
        localStorage.removeItem('smrmp_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      finishRestoringSession: () => set({ isRestoringSession: false }),

      hasRole: (...roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      can: (permission) => {
        const { user } = get();
        if (!user) return false;
        const perms = user.permissions || [];
        return perms.includes(permission);
      },

      canAny: (...permissions) => {
        const { user } = get();
        if (!user) return false;
        const perms = user.permissions || [];
        return permissions.some((p) => perms.includes(p));
      },

      canAll: (...permissions) => {
        const { user } = get();
        if (!user) return false;
        const perms = user.permissions || [];
        return permissions.every((p) => perms.includes(p));
      },
    }),
    {
      name: 'smrmp_auth',
      // Bump when RBAC shape changes so stale role/permission snapshots are dropped.
      version: 2,
      migrate: () => ({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

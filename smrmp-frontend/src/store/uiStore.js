import { create } from 'zustand';

const useUiStore = create((set) => ({
  loading: false,
  isMobileOpen: false,
  isCollapsed: false,
  setLoading: (loading) => set({ loading }),
  toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  closeMobile: () => set({ isMobileOpen: false }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));

export default useUiStore;

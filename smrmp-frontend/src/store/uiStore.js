import { create } from 'zustand';

const useUiStore = create((set) => ({
  loading: false,
  // Admin / staff shell
  isMobileOpen: false,
  isCollapsed: false,
  // Visitor portal shell (separate so roles never clash)
  visitorMobileOpen: false,
  visitorCollapsed: false,

  setLoading: (loading) => set({ loading }),

  toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  closeMobile: () => set({ isMobileOpen: false }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

  toggleVisitorMobile: () =>
    set((state) => ({ visitorMobileOpen: !state.visitorMobileOpen })),
  closeVisitorMobile: () => set({ visitorMobileOpen: false }),
  toggleVisitorCollapsed: () =>
    set((state) => ({ visitorCollapsed: !state.visitorCollapsed })),
}));

export default useUiStore;

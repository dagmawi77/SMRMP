import { create } from 'zustand';

const useUiStore = create((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));

export default useUiStore;

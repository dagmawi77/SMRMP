import api from './axios';
import { getDemoLoginResponse, isBackendUnavailable } from './demoAuth';

export const authApi = {
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch (error) {
      // Fall back to demo auth when backend isn't running yet
      if (isBackendUnavailable(error) || import.meta.env.VITE_DEMO_MODE === 'true') {
        return getDemoLoginResponse(data);
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } catch (error) {
      if (isBackendUnavailable(error) || import.meta.env.VITE_DEMO_MODE === 'true') {
        return { data: { success: true, message: 'Logged out (demo mode)' } };
      }
      throw error;
    }
  },

  getMe: async () => {
    try {
      return await api.get('/auth/me');
    } catch (error) {
      if (isBackendUnavailable(error) || import.meta.env.VITE_DEMO_MODE === 'true') {
        const stored = localStorage.getItem('smrmp_user');
        if (stored) {
          return { data: { success: true, data: JSON.parse(stored) } };
        }
      }
      throw error;
    }
  },
};

export default authApi;

import api from './axios';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (payload) => api.post('/auth/change-password', payload),
};

export default authApi;

import api from './axios';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  updatePassword: (password) => api.post('/auth/update-password', { password }),
};

export default authApi;

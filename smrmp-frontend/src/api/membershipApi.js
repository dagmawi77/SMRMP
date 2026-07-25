import api from './axios';

export const membershipApi = {
  // Public
  getTiers: (params = {}) => api.get('/memberships/tiers', { params }),
  getCard: (id) => api.get(`/memberships/${id}/card`),

  // Staff
  list: (params = {}) => api.get('/memberships', { params }),
  create: (data) => api.post('/memberships', data),
  getById: (id) => api.get(`/memberships/${id}`),
  update: (id, data) => api.put(`/memberships/${id}`, data),
  renew: (id, data = {}) => api.post(`/memberships/${id}/renew`, data),
  cancel: (id, reason) => api.post(`/memberships/${id}/cancel`, { reason }),
  getExpiring: (days = 30) => api.get('/memberships/expiring', { params: { days } }),
  sendReminders: (days = 30) => api.post('/memberships/renewal-reminders', { days }),
  verify: (code) => api.get(`/memberships/verify/${code}`),
};

export default membershipApi;

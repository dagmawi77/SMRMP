import api from './axios';

export const feedbackApi = {
  // Public
  submit: (data) => api.post('/feedback', data),
  getPublic: (params = {}) => api.get('/feedback/public', { params }),

  // Staff
  list: (params = {}) => api.get('/feedback', { params }),
  getAnalytics: () => api.get('/feedback/analytics'),
  getById: (id) => api.get(`/feedback/${id}`),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  respond: (id, responseText) => api.post(`/feedback/${id}/respond`, { response_text: responseText }),
  publish: (id) => api.post(`/feedback/${id}/publish`, { is_public: true }),
};

export default feedbackApi;

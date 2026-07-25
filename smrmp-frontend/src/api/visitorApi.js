import api from './axios';

export const visitorApi = {
  list: (params = {}) => api.get('/visitors', { params }),
  search: (q) => api.get('/visitors/search', { params: { q } }),
  create: (data) => api.post('/visitors', data),
  getById: (id) => api.get(`/visitors/${id}`),
  update: (id, data) => api.put(`/visitors/${id}`, data),
  remove: (id) => api.delete(`/visitors/${id}`),
  checkIn: (id, data = {}) => api.post(`/visitors/${id}/checkin`, data),
  getVisits: (id, params = {}) => api.get(`/visitors/${id}/visits`, { params }),
  getMemberships: (id) => api.get(`/visitors/${id}/memberships`),
  getFeedback: (id) => api.get(`/visitors/${id}/feedback`),
  getCommunications: (id) => api.get(`/visitors/${id}/communications`),
  analyticsSummary: () => api.get('/visitors/analytics/summary'),
  analyticsTrends: (days = 30) => api.get('/visitors/analytics/trends', { params: { days } }),
  analyticsSegments: () => api.get('/visitors/analytics/segments'),
  analyticsFeedback: () => api.get('/visitors/analytics/feedback'),
};

export default visitorApi;

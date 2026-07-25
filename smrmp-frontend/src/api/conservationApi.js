import api from './axios';

export const conservationApi = {
  getAll: (params = {}) => api.get('/conservation', { params }),
  getById: (id) => api.get(`/conservation/${id}`),
  create: (data) => api.post('/conservation', data),
  update: (id, data) => api.put(`/conservation/${id}`, data),
  remove: (id) => api.delete(`/conservation/${id}`),
};

export default conservationApi;

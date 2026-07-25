import api from './axios';

export const exhibitionApi = {
  getAll: (params = {}) => api.get('/exhibitions', { params }),
  getPublic: (params = {}) => api.get('/exhibitions/public', { params }),
  getPublicById: (id) => api.get(`/exhibitions/public/${id}`),
  getById: (id) => api.get(`/exhibitions/${id}`),
  create: (data) => api.post('/exhibitions', data),
  update: (id, data) => api.put(`/exhibitions/${id}`, data),
  remove: (id) => api.delete(`/exhibitions/${id}`),
};

export default exhibitionApi;

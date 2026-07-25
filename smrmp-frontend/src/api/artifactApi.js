import api from './axios';

export const artifactApi = {
  getAll: (params) => api.get('/artifacts', { params }),
  getById: (id) => api.get(`/artifacts/${id}`),
  getByQR: (code) => api.get(`/artifacts/qr/${code}`),
  create: (formData) =>
    api.post('/artifacts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/artifacts/${id}`, data),
  remove: (id) => api.delete(`/artifacts/${id}`),
};

export default artifactApi;

import api from './axios';

export const userApi = {
  list: (params) => api.get('/users', { params }),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  updateStatus: (id, is_active) =>
    api.patch(`/users/${id}/status`, { is_active }),
};

export const roleApi = {
  list: () => api.get('/roles'),
  listPermissions: () => api.get('/roles/permissions'),
  create: (payload) => api.post('/roles', payload),
  update: (id, payload) => api.patch(`/roles/${id}`, payload),
  remove: (id) => api.delete(`/roles/${id}`),
  assignPermissions: (id, permission_ids) =>
    api.put(`/roles/${id}/permissions`, { permission_ids }),
};

export default userApi;

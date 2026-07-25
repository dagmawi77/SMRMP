import api from './axios';

export const groupBookingApi = {
  // Public
  create: (data) => api.post('/group-bookings', data),

  // Staff
  list: (params = {}) => api.get('/group-bookings', { params }),
  getToday: () => api.get('/group-bookings/today'),
  getById: (id) => api.get(`/group-bookings/${id}`),
  update: (id, data) => api.put(`/group-bookings/${id}`, data),
  confirm: (id, data = {}) => api.post(`/group-bookings/${id}/confirm`, data),
  cancel: (id, reason) => api.post(`/group-bookings/${id}/cancel`, { reason }),
  complete: (id) => api.post(`/group-bookings/${id}/complete`),
  getInvoice: (id) => api.get(`/group-bookings/${id}/invoice`),
};

export default groupBookingApi;

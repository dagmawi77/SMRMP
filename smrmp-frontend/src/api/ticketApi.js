import api from './axios';

export const ticketApi = {
  getTypes: () => api.get('/tickets/types'),
  purchase: (data) => api.post('/tickets/purchase', data),
  verify: (code) => api.get(`/tickets/verify/${code}`),
};

export default ticketApi;

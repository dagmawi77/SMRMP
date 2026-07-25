import api from './axios';

/**
 * Visitor Portal — self-scoped endpoints for the signed-in visitor (req.user).
 */
export const portalApi = {
  getDashboard: () => api.get('/portal/dashboard'),
  getProfile: () => api.get('/portal/profile'),
  updateProfile: (data) => api.put('/portal/profile', data),
  getMemberships: () => api.get('/portal/memberships'),
  getVisits: () => api.get('/portal/visits'),
  getTickets: () => api.get('/portal/tickets'),
  getBookings: () => api.get('/portal/bookings'),
};

export default portalApi;

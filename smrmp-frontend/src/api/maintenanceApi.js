import api from './axios';

export const maintenanceApi = {
  getDashboard: () => api.get('/maintenance/dashboard'),
  getRequests: (params) => api.get('/maintenance/requests', { params }),
  getRequest: (code) => api.get(`/maintenance/requests/${code}`),
  closeRequest: (code, closeNotes) =>
    api.patch(`/maintenance/requests/${code}/close`, { close_notes: closeNotes }),
};

export default maintenanceApi;

import api from './axios';

export const notificationApi = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch {
      // Fallback for offline / client state
      return { success: true, data: [] };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch {
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch {
      return { success: true };
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch {
      return { success: true };
    }
  },

  createNotification: async (data) => {
    try {
      const response = await api.post('/notifications', data);
      return response.data;
    } catch {
      return { success: true };
    }
  },
};

export default notificationApi;

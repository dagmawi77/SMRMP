import api from './axios';
import { getLocalArtifacts, isBackendError } from './mockStore';

export const dashboardApi = {
  getStats: async () => {
    try {
      return await api.get('/dashboard/stats');
    } catch (error) {
      if (isBackendError(error)) {
        const artifacts = getLocalArtifacts();
        const conservationAlerts = artifacts.filter((a) =>
          ['poor', 'critical'].includes(a.condition_status)
        ).length;

        return {
          data: {
            success: true,
            data: {
              stats: {
                total_artifacts: artifacts.length,
                active_exhibitions: 4,
                conservation_alerts: conservationAlerts,
                visitors_today: 184,
                tickets_sold_this_month: 2450,
              },
              recent_artifacts: artifacts.slice(0, 5),
            },
          },
        };
      }
      throw error;
    }
  },

  getCharts: async () => {
    try {
      return await api.get('/dashboard/charts');
    } catch (error) {
      if (isBackendError(error)) {
        const artifacts = getLocalArtifacts();

        // Calculate categories
        const catMap = {};
        artifacts.forEach((a) => {
          catMap[a.category] = (catMap[a.category] || 0) + 1;
        });

        // Calculate condition
        const condMap = {};
        artifacts.forEach((a) => {
          condMap[a.condition_status] = (condMap[a.condition_status] || 0) + 1;
        });

        return {
          data: {
            success: true,
            data: {
              categories: Object.entries(catMap).map(([category, count]) => ({ category, count })),
              conservation_status: Object.entries(condMap).map(([condition_status, count]) => ({
                condition_status,
                count,
              })),
              visitor_trend: [
                { date: 'Jul 19', count: 120 },
                { date: 'Jul 20', count: 145 },
                { date: 'Jul 21', count: 190 },
                { date: 'Jul 22', count: 210 },
                { date: 'Jul 23', count: 175 },
                { date: 'Jul 24', count: 230 },
                { date: 'Jul 25', count: 184 },
              ],
            },
          },
        };
      }
      throw error;
    }
  },
};

export default dashboardApi;

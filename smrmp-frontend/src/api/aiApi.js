import api from './axios';

export const aiApi = {
  describeArtifact: (data) => api.post('/ai/describe-artifact', data),
  search: (query) => api.post('/ai/search', { query }),
  generateReport: (report_type) => api.post('/ai/generate-report', { report_type }),
  ask: (question) => api.post('/ai/ask', { question }),
};

export default aiApi;

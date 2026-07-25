import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smrmp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('smrmp_token');
      localStorage.removeItem('smrmp_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/artifact/')) {
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission for this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  },
);

export default api;

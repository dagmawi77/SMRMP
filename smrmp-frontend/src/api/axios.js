import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isPublicPath = () => {
  const { pathname } = window.location;
  return (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/artifact/') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/feedback') ||
    pathname.startsWith('/book-group-visit') ||
    pathname.startsWith('/membership/')
  );
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // A rejected login attempt is reported by the login page itself, so only
      // tear down the session for requests made from an authenticated screen.
      if (!isPublicPath()) {
        const { token } = useAuthStore.getState();
        if (!token?.startsWith('demo-token-')) {
          useAuthStore.getState().clearAuth();
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      }
    } else if (status === 403) {
      toast.error('You do not have permission for this action.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  },
);

export default api;

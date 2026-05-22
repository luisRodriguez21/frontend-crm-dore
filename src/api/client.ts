import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jcrm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jcrm_token');
      localStorage.removeItem('jcrm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

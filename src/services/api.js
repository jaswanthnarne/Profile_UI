import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach token
const token = localStorage.getItem('adminToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      delete api.defaults.headers.common['Authorization'];
      if (window.location.pathname.startsWith('/console/admin') &&
          !window.location.pathname.includes('/console/admin/login')) {
        window.location.href = '/console/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

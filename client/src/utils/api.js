import axios from 'axios';

// For Vercel, the API and frontend share the same domain, so we just use /api
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 
    'Content-Type': 'application/json'
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agriqueue_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agriqueue_token');
      localStorage.removeItem('agriqueue_farmer');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

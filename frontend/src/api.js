import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8087/api',
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (set by Keycloak)
    const token = localStorage.getItem('kc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Authentication error - token may be expired or invalid');
      // Clear local storage
      localStorage.removeItem('kc_token');
      // Instead of reloading, let the app handle authentication
      // The Keycloak initialization will handle redirecting to login if needed
    }
    return Promise.reject(error);
  }
);

export default api;

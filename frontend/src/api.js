import axios from 'axios';

// Create axios instance for product-service
const api = axios.create({
  baseURL: 'http://localhost:8083',
});

// Create axios instance for command-service
const apiOrder = axios.create({
  baseURL: 'http://localhost:8082',
});

// Request interceptor for product-service
api.interceptors.request.use(
  (config) => {
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

// Request interceptor for command-service
apiOrder.interceptors.request.use(
  (config) => {
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

// Response interceptor for product-service
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication error - token may be expired or invalid');
      localStorage.removeItem('kc_token');
    }
    return Promise.reject(error);
  }
);

// Response interceptor for command-service
apiOrder.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication error - token may be expired or invalid');
      localStorage.removeItem('kc_token');
    }
    return Promise.reject(error);
  }
);

export default api;
export { apiOrder };

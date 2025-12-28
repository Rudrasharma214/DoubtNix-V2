import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add accessToken to all requests
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    // DISABLED for debugging logout API
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('accessToken');
    //   window.location.href = '/login';
    // }
    console.log('API Error:', error.response?.status, error.response?.data?.message);
    return Promise.reject(error);
  }
);

export default api;

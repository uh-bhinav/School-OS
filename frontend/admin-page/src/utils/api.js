import axios from 'axios';
import { config } from './config.js';

export const apiClient = axios.create({
  baseURL: config.API_URL,
  withCredentials: false,
  timeout: 30000, // 30 seconds
});

apiClient.interceptors.request.use((axiosConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    axiosConfig.headers = axiosConfig.headers || {};
    axiosConfig.headers.Authorization = `Bearer ${token}`;
  }
  return axiosConfig;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error?.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Reload page to trigger AuthGuard to show login page
        window.location.reload();
      }
      return Promise.reject(new Error('Authentication required. Please login again.'));
    }
    
    const message = error?.response?.data?.detail || error?.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: (path, config) => apiClient.get(path, config).then((r) => r.data),
  post: (path, data, config) => apiClient.post(path, data, config).then((r) => r.data),
  put: (path, data, config) => apiClient.put(path, data, config).then((r) => r.data),
  patch: (path, data, config) => apiClient.patch(path, data, config).then((r) => r.data),
  delete: (path, config) => apiClient.delete(path, config).then((r) => r.data),
};

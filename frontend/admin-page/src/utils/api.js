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
  } else {
    console.warn('API Request without token:', axiosConfig.url);
  }
  return axiosConfig;
}, (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Better error logging for debugging
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Network Error')) {
      const fullURL = error.config?.baseURL && error.config?.url 
        ? `${error.config.baseURL}${error.config.url}`
        : error.config?.url || 'unknown';
      
      console.error('Network Error Details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL,
        method: error.config?.method,
        hasToken: !!error.config?.headers?.Authorization,
        errorCode: error.code,
        errorMessage: error.message,
      });
      
      // Don't show error if it's just a connection issue - backend might be starting
      if (error.config?.url?.includes('/profiles/me')) {
        // This is a critical endpoint, but we'll handle it gracefully
        return Promise.reject(new Error(`Unable to connect to backend at ${error.config?.baseURL || 'http://127.0.0.1:8000/v1'}. Please ensure the backend server is running.`));
      }
      
      return Promise.reject(new Error(`Network error: Unable to connect to ${error.config?.baseURL || 'backend'}. Please ensure the backend server is running.`));
    }

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
    
    // Log other errors for debugging
    if (error?.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    }
    
    const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: (path, config) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return apiClient.get(normalizedPath, config).then((r) => r.data);
  },
  post: (path, data, config) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return apiClient.post(normalizedPath, data, config).then((r) => r.data);
  },
  put: (path, data, config) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return apiClient.put(normalizedPath, data, config).then((r) => r.data);
  },
  patch: (path, data, config) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return apiClient.patch(normalizedPath, data, config).then((r) => r.data);
  },
  delete: (path, config) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return apiClient.delete(normalizedPath, config).then((r) => r.data);
  },
};

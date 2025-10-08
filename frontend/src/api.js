import axios from "axios";
import { getCsrfToken } from "./csrf";

const api = axios.create({
  baseURL: "https://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add CSRF token to all state-changing requests
api.interceptors.request.use(
  async (config) => {
    // Add CSRF token for POST, PUT, DELETE, PATCH requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_VALIDATION_FAILED') {
      console.error('CSRF validation failed. Please refresh the page.');
    }
    return Promise.reject(error);
  }
);

export default api;
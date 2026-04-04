import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Auto-detect environment to bypass Vercel environment variable issues
const defaultBaseURL = import.meta.env.MODE === 'production' 
  ? 'https://loansense-production.up.railway.app' 
  : 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and state
      useAuthStore.getState().logout();
      // Redirect to login (vanilla JS redirect works regardless of React Router context here)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

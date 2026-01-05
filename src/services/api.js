// src/services/api.js
import axios from 'axios';

// Support either REACT_APP_API_URL or REACT_APP_BACKEND_URL (append /api)
const envApiUrl = process.env.REACT_APP_API_URL;
const envBackendUrl = process.env.REACT_APP_BACKEND_URL;

let API_BASE_URL = '';

if (envApiUrl && envApiUrl.length) {
  API_BASE_URL = envApiUrl.replace(/\/$/, ''); // use as provided
} else if (envBackendUrl && envBackendUrl.length) {
  API_BASE_URL = envBackendUrl.replace(/\/$/, '') + '/api';
} else {
  API_BASE_URL = 'http://localhost:5000/api';
}

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // Increased to 15 seconds for better handling
  withCredentials: false, // Set to false to avoid cookie issues
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        if (!config.headers) config.headers = {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Failed to get token from localStorage:', err);
    }

    console.log('Making request to:', config.url, 'Method:', config.method);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    // Removed unused variable assignment: const originalRequest = error.config;
    
    // Log detailed error information
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Handle network errors
    if (!error.response) {
      console.error('Network error - backend may be down or URL incorrect');
      console.error('Please check if the server is running at:', API_BASE_URL);
    }

    // Handle specific status codes
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - redirecting to login');
      try {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } catch (e) {
        console.warn('Failed to remove token:', e);
      }
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config.url);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    // Return a more descriptive error
    const enhancedError = {
      ...error,
      message: error.response?.data?.message || error.message || 'An unknown error occurred',
      status: error.response?.status,
      data: error.response?.data
    };

    return Promise.reject(enhancedError);
  }
);

// Helper functions for common API calls
export const sendHelpMessage = async (message) => {
  try {
    const response = await api.post('/help/message', { message });
    return response.data;
  } catch (error) {
    console.error('Failed to send help message:', error);
    throw error;
  }
};

export const getHelpTopics = async () => {
  try {
    const response = await api.get('/help/topics');
    return response.data;
  } catch (error) {
    console.error('Failed to get help topics:', error);
    throw error;
  }
};

export const testApiConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Failed to test API connection:', error);
    throw error;
  }
};

export const sendFeedback = async (data) => {
  try {
    const response = await api.post('/help/feedback', data);
    return response.data;
  } catch (error) {
    console.error('Failed to send feedback:', error);
    throw error;
  }
};

export default api;
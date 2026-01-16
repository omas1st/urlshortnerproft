// File: src/services/api.js
import axios from 'axios';

// Support either REACT_APP_API_URL or REACT_APP_BACKEND_URL (append /api)
const envApiUrl = process.env.REACT_APP_API_URL;
const envBackendUrl = process.env.REACT_APP_BACKEND_URL;

// Allow credentials only when explicitly enabled via env var.
// (Set REACT_APP_ALLOW_CREDENTIALS=true in Vercel if server supports cookies)
const allowCredentials = process.env.REACT_APP_ALLOW_CREDENTIALS === 'true';

// Compute API base URL safely:
// 1. Use REACT_APP_API_URL if provided (exactly as provided, trimmed).
// 2. Else use REACT_APP_BACKEND_URL + '/api' if provided.
// 3. Else, if running in browser, use window.location.origin + '/api' (same-origin).
// 4. Fallback to 'http://localhost:5000/api' for local dev (rare in real browser).
let API_BASE_URL = '';

if (envApiUrl && envApiUrl.trim().length) {
  API_BASE_URL = envApiUrl.replace(/\/+$/, ''); // use as provided, strip trailing slash
} else if (envBackendUrl && envBackendUrl.trim().length) {
  API_BASE_URL = envBackendUrl.replace(/\/+$/, '') + '/api';
} else if (typeof window !== 'undefined' && window.location && window.location.origin) {
  // Use same origin + /api when deployed on same host
  API_BASE_URL = `${window.location.origin.replace(/\/+$/, '')}/api`;
} else {
  // Final fallback for non-browser environments / dev
  API_BASE_URL = 'http://localhost:5000/api';
}

console.log('API Base URL:', API_BASE_URL);
console.log('Allow credentials (withCredentials):', allowCredentials);

// axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 15000, // 15 seconds
  // IMPORTANT: allow cookies only when explicitly enabled
  withCredentials: allowCredentials
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

    // Helpful debug log in dev only
    if (process.env.NODE_ENV === 'development') {
      console.log('Making request to:', config.baseURL ? `${config.baseURL}${config.url}` : config.url, 'Method:', config.method);
    }
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Response from:', response.config.url, 'Status:', response.status);
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    const cfg = error.config || {};
    console.error('API Error Details:', {
      url: cfg.url,
      method: cfg.method,
      baseURL: cfg.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Mark network error when no response (likely CORS or network)
    if (!error.response) {
      error.isNetworkError = true;
      console.error('Network error - backend may be down or URL incorrect');
      console.error('Please check if the server is running at:', API_BASE_URL);
    }

    // Handle specific status codes
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - clearing token and redirecting to login');
      try {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } catch (e) {
        console.warn('Failed to remove token:', e);
      }
      // Only navigate if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 404) {
      console.error('Endpoint not found:', cfg.url);
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

// Custom Domain API functions
export const addCustomDomain = async (domainData) => {
  try {
    const response = await api.post('/custom-domains/add', domainData);
    return response.data;
  } catch (error) {
    console.error('Failed to add custom domain:', error);
    throw error;
  }
};

export const verifyCustomDomain = async (domainId) => {
  try {
    const response = await api.post(`/custom-domains/${domainId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Failed to verify domain:', error);
    throw error;
  }
};

export const getUserCustomDomains = async () => {
  try {
    const response = await api.get('/custom-domains');
    return response.data;
  } catch (error) {
    console.error('Failed to get custom domains:', error);
    throw error;
  }
};

export const getBrandableUrls = async () => {
  try {
    const response = await api.get('/custom-domains/urls/brandable');
    return response.data;
  } catch (error) {
    console.error('Failed to get brandable URLs:', error);
    throw error;
  }
};

export const deleteCustomDomain = async (domainId) => {
  try {
    const response = await api.delete(`/custom-domains/${domainId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete domain:', error);
    throw error;
  }
};

export default api;

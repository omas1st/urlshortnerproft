// src/services/authService.js
import api from '../api'; // adjust if your api.js path differs

const parseError = (err) => {
  if (!err) return 'Unknown error';
  if (err.response && err.response.data) {
    const d = err.response.data;
    if (typeof d === 'string') {
      return d.replace(/<[^>]*>/g, '').trim();
    }
    if (d.message) return d.message;
    if (d.error) return d.error;
    try {
      return JSON.stringify(d);
    } catch (e) {
      return String(d);
    }
  }
  if (err.message) return err.message;
  return String(err);
};

export const authService = {
  login: async (emailOrUsername, password) => {
    try {
      const resp = await api.post('/auth/login', { emailOrUsername, password });
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  register: async (userData) => {
    try {
      const resp = await api.post('/auth/register', userData);
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  getCurrentUser: async () => {
    try {
      const resp = await api.get('/auth/me');
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  forgotPassword: async (email) => {
    try {
      const resp = await api.post('/auth/forgot-password', { email });
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  resetPassword: async (token, password, confirmPassword) => {
    try {
      const resp = await api.post('/auth/reset-password', { token, password, confirmPassword });
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  updateProfile: async (userData) => {
    try {
      const resp = await api.put('/auth/profile', userData);
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const resp = await api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword });
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  },

  adminLogin: async (username, password) => {
    try {
      const resp = await api.post('/auth/admin-login', { username, password });
      return { success: true, data: resp.data };
    } catch (err) {
      return { success: false, error: parseError(err) };
    }
  }
};

export default authService;

// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api'; // updated api instance

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    fetchUserIfToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserIfToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // api interceptor will include Authorization header
      const response = await api.get('/auth/me');

      if (response?.data) {
        // response shapes can differ — handle common shapes
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
        } else if (response.data.user) {
          setUser(response.data.user);
        } else {
          // fallback: assume response.data is the user object
          setUser(response.data);
        }
      } else {
        // Unexpected: clear token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } catch (error) {
      // network or auth error: clear token
      console.error('Auth context fetch error:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername, password) => {
    try {
      const response = await api.post('/auth/login', { emailOrUsername, password });

      // Handle response shape
      let token, userObj;
      if (response.data && response.data.success) {
        token = response.data.token;
        userObj = response.data.user;
      } else if (response.data) {
        token = response.data.token;
        userObj = response.data.user || response.data;
      } else {
        throw new Error('Invalid response from server');
      }

      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(userObj);
      toast.success(response.data?.message || 'Login successful!');

      if (userObj?.role === 'admin') {
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      }

      return { success: true, data: response.data, user: userObj };
    } catch (error) {
      // Distinguish network error vs API error
      if (error.isNetworkError || !error.response) {
        const msg = `Network error — could not reach API at ${api.defaults.baseURL}`;
        toast.error(msg);
        console.error(msg, error);
        return { success: false, error: msg };
      }

      const message = error?.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      let token, userObj;
      if (response.data && response.data.success) {
        token = response.data.token;
        userObj = response.data.user;
      } else if (response.data) {
        token = response.data.token;
        userObj = response.data.user || response.data;
      } else {
        throw new Error('Invalid response from server');
      }

      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(userObj);
      toast.success(response.data?.message || 'Registration successful!');
      return { success: true, data: response.data, user: userObj };
    } catch (error) {
      if (error.isNetworkError || !error.response) {
        const msg = `Network error — could not reach API at ${api.defaults.baseURL}`;
        toast.error(msg);
        console.error(msg, error);
        return { success: false, error: msg };
      }

      const message = error?.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const saveRedirectUrl = (url) => setRedirectUrl(url);
  const clearRedirectUrl = () => setRedirectUrl('');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      redirectUrl,
      saveRedirectUrl,
      clearRedirectUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};

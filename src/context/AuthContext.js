// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api'; // <-- uses your api.js file which sets baseURL to REACT_APP_API_URL

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    // api interceptor already adds token from localStorage (your api.js does that)
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
      // api interceptor will add Authorization header automatically
      const response = await api.get('/auth/me');
      
      // Handle different response formats
      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
      } else if (response.data && response.data.user) {
        setUser(response.data.user);
      } else if (response.data) {
        // If data itself is the user object
        setUser(response.data);
      } else {
        // unexpected shape -> clear auth
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } catch (error) {
      console.error('Auth context fetch error:', error);
      // token invalid or server error -> clear token
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
      
      // Handle response format
      let token, userObj;
      
      if (response.data && response.data.success) {
        token = response.data.token;
        userObj = response.data.user;
      } else if (response.data) {
        // Assume response.data contains token and user directly
        token = response.data.token;
        userObj = response.data;
      } else {
        throw new Error('Invalid response from server');
      }
      
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      setUser(userObj);
      toast.success(response.data?.message || 'Login successful!');
      
      // Redirect admin users to admin panel
      if (userObj?.role === 'admin') {
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      }
      
      return { success: true, data: response.data, user: userObj };
      
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Handle response format
      let token, userObj;
      
      if (response.data && response.data.success) {
        token = response.data.token;
        userObj = response.data.user;
      } else if (response.data) {
        token = response.data.token;
        userObj = response.data;
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
      // Removed verifyIdentity and resetPassword since Login.js uses api directly
    }}>
      {children}
    </AuthContext.Provider>
  );
};
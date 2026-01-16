// File: src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Login.css';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, redirectUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || redirectUrl || '/dashboard';

  const validateForm = () => {
    const newErrors = {};

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(emailOrUsername, password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors((prev) => ({ ...prev, form: result.message || 'Invalid credentials' }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: 'An unexpected error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />

      <main className="auth-main">
        <div className="container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>
                <FaSignInAlt aria-hidden="true" /> Welcome Back
              </h2>
              <p className="muted">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {errors.form && <div className="form-error">{errors.form}</div>}

              <div className="form-group">
                <label htmlFor="emailOrUsername">
                  <FaEnvelope aria-hidden="true" /> Email or Username
                </label>
                <input
                  type="text"
                  id="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => {
                    setEmailOrUsername(e.target.value.toLowerCase());
                    setErrors({ ...errors, emailOrUsername: '' });
                  }}
                  placeholder="Enter email or username"
                  className={errors.emailOrUsername ? 'error' : ''}
                  disabled={loading}
                  autoComplete="username"
                />
                {errors.emailOrUsername && (
                  <span className="error-message">{errors.emailOrUsername}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FaLock aria-hidden="true" /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="auth-footer">
                <p className="small">
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Create one now
                  </Link>
                </p>
              </div>
            </form>

            {/* Social login and admin note removed as requested */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

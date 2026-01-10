// File: src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Add this import
import { FaEnvelope, FaLock, FaSignInAlt, FaUser, FaTimes } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Login.css';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot password modal states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: verify, 2: reset password
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotSuccess, setForgotSuccess] = useState('');

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

  const validateForgotStep1 = () => {
    const newErrors = {};

    if (!forgotEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!forgotUsername.trim()) {
      newErrors.username = 'Username is required';
    }

    setForgotErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotStep2 = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, and numbers';
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    setForgotErrors(newErrors);
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
        setErrors((prev) => ({ ...prev, form: result.error || 'Invalid credentials' }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: 'An unexpected error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (forgotStep === 1) {
      if (!validateForgotStep1()) return;

      setForgotLoading(true);
      try {
        // Use api instance instead of fetch
        const response = await api.post('/auth/verify-identity', { 
          email: forgotEmail.toLowerCase(), 
          username: forgotUsername.toLowerCase() 
        });

        if (response.data && response.data.success) {
          setForgotStep(2);
          setForgotErrors({});
          setForgotSuccess('');
        } else {
          setForgotErrors({ 
            form: response.data?.message || 'Email and username do not match. Please contact admin for password recovery.' 
          });
        }
      } catch (error) {
        const message = error?.response?.data?.message || error.message || 'An error occurred. Please try again.';
        setForgotErrors({ form: message });
      } finally {
        setForgotLoading(false);
      }
    } else {
      if (!validateForgotStep2()) return;

      setForgotLoading(true);
      try {
        // Use api instance instead of fetch
        const response = await api.post('/auth/reset-password-via-identity', {
          email: forgotEmail.toLowerCase(),
          username: forgotUsername.toLowerCase(),
          newPassword,
          confirmPassword: confirmNewPassword
        });

        if (response.data && response.data.success) {
          setForgotSuccess('Password reset successfully! You can now log in with your new password.');
          setTimeout(() => {
            setShowForgotPassword(false);
            resetForgotPasswordForm();
          }, 3000);
        } else {
          setForgotErrors({ 
            form: response.data?.message || 'Password reset failed. Please try again.' 
          });
        }
      } catch (error) {
        const message = error?.response?.data?.message || error.message || 'An error occurred. Please try again.';
        setForgotErrors({ form: message });
      } finally {
        setForgotLoading(false);
      }
    }
  };

  const resetForgotPasswordForm = () => {
    setForgotEmail('');
    setForgotUsername('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotStep(1);
    setForgotErrors({});
    setForgotSuccess('');
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    resetForgotPasswordForm();
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
                <button 
                  type="button" 
                  className="forgot-password-btn"
                  onClick={openForgotPassword}
                >
                  Forgot password?
                </button>
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
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaLock aria-hidden="true" /> Reset Password
              </h3>
              <button 
                className="modal-close" 
                onClick={() => setShowForgotPassword(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {forgotStep === 1 ? (
                <>
                  <p className="muted">Enter your email and username to verify your identity</p>
                  
                  {forgotErrors.form && (
                    <div className="form-error">{forgotErrors.form}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="forgotEmail">
                      <FaEnvelope aria-hidden="true" /> Email Address
                    </label>
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotErrors({ ...forgotErrors, email: '' });
                      }}
                      placeholder="Enter your registered email"
                      className={forgotErrors.email ? 'error' : ''}
                      disabled={forgotLoading}
                    />
                    {forgotErrors.email && (
                      <span className="error-message">{forgotErrors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgotUsername">
                      <FaUser aria-hidden="true" /> Username
                    </label>
                    <input
                      type="text"
                      id="forgotUsername"
                      value={forgotUsername}
                      onChange={(e) => {
                        setForgotUsername(e.target.value.toLowerCase());
                        setForgotErrors({ ...forgotErrors, username: '' });
                      }}
                      placeholder="Enter your username"
                      className={forgotErrors.username ? 'error' : ''}
                      disabled={forgotLoading}
                    />
                    {forgotErrors.username && (
                      <span className="error-message">{forgotErrors.username}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="muted">Set your new password</p>
                  
                  {forgotErrors.form && (
                    <div className="form-error">{forgotErrors.form}</div>
                  )}

                  {forgotSuccess && (
                    <div className="form-success">{forgotSuccess}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="newPassword">
                      <FaLock aria-hidden="true" /> New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setForgotErrors({ ...forgotErrors, newPassword: '' });
                      }}
                      placeholder="Enter new password"
                      className={forgotErrors.newPassword ? 'error' : ''}
                      disabled={forgotLoading}
                    />
                    {forgotErrors.newPassword && (
                      <span className="error-message">{forgotErrors.newPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">
                      <FaLock aria-hidden="true" /> Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        setForgotErrors({ ...forgotErrors, confirmNewPassword: '' });
                      }}
                      placeholder="Confirm new password"
                      className={forgotErrors.confirmNewPassword ? 'error' : ''}
                      disabled={forgotLoading}
                    />
                    {forgotErrors.confirmNewPassword && (
                      <span className="error-message">{forgotErrors.confirmNewPassword}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {forgotStep === 1 ? (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Verifying...' : 'Verify Identity'}
                </button>
              ) : (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              )}
              
              {forgotStep === 2 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setForgotStep(1)}
                  disabled={forgotLoading}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Login;
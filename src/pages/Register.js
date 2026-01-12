import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaEnvelope,
  FaUser,
  FaLock,
  FaCheck,
  FaTimes,
  FaUserPlus
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import validator from 'validator';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // NEW: terms agreement state
  const [agree, setAgree] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Pure function - does NOT call setState
  const validatePassword = (password) => {
    let strength = 0;
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(requirements).forEach(req => {
      if (req) strength += 20;
    });

    return { requirements, strength };
  };

  // Derived requirements object for rendering (no state mutation)
  const passwordReqs = validatePassword(formData.password).requirements;

  // Update passwordStrength whenever the password changes (safe - inside an effect)
  useEffect(() => {
    const { strength } = validatePassword(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ff4444';
    if (passwordStrength < 80) return '#ffbb33';
    return '#00C851';
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validator.isEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    const { requirements } = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!requirements.lowercase || !requirements.uppercase || !requirements.number) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // NEW: Terms agreement validation
    if (!agree) {
      newErrors.agree = 'You must agree to the Terms and Privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'email' || name === 'username' ? value.toLowerCase() : value;

    // Only update form data here; no other setState calls
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear field-specific error (safe)
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // NEW: handle checkbox change
  const handleAgreeChange = (e) => {
    setAgree(e.target.checked);
    setErrors(prev => ({ ...prev, agree: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        navigate('/dashboard');
      } else {
        // show server-side message in general error slot
        const errorMessage = result.error || result.data?.message || 'Registration failed';
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header />

      <main className="auth-main">
        <div className="container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>
                <FaUserPlus /> Create Account
              </h2>
              <p>Join ShortLink Pro to start shortening URLs</p>
            </div>

            {errors.general && (
              <div className="alert alert-error">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="username">
                  <FaUser /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={errors.username ? 'error' : ''}
                  disabled={loading}
                />
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar" style={{ background: '#eee', borderRadius: 4, height: 8 }}>
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor(),
                          height: '100%',
                          borderRadius: 4,
                          transition: 'width 150ms ease'
                        }}
                      />
                    </div>
                    <div className="strength-text" style={{ marginTop: 6 }}>
                      Strength: {passwordStrength < 40 ? 'Weak' : passwordStrength < 80 ? 'Fair' : 'Strong'}
                    </div>

                    <div className="password-requirements">
                      <p>Password must contain:</p>
                      <ul>
                        <li className={passwordReqs.length ? 'valid' : 'invalid'}>
                          {passwordReqs.length ? <FaCheck /> : <FaTimes />} At least 8 characters
                        </li>
                        <li className={passwordReqs.lowercase ? 'valid' : 'invalid'}>
                          {passwordReqs.lowercase ? <FaCheck /> : <FaTimes />} Lowercase letters
                        </li>
                        <li className={passwordReqs.uppercase ? 'valid' : 'invalid'}>
                          {passwordReqs.uppercase ? <FaCheck /> : <FaTimes />} Uppercase letters
                        </li>
                        <li className={passwordReqs.number ? 'valid' : 'invalid'}>
                          {passwordReqs.number ? <FaCheck /> : <FaTimes />} Numbers
                        </li>
                        <li className={passwordReqs.special ? 'valid' : 'invalid'}>
                          {passwordReqs.special ? <FaCheck /> : <FaTimes />} Special characters
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock /> Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              {/* NEW: Terms & Privacy agreement area */}
              <div className="form-group terms-group" style={{ marginTop: 8 }}>
                <label className="terms-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={handleAgreeChange}
                    disabled={loading}
                    aria-describedby="terms-desc"
                  />
                  <span id="terms-desc" style={{ lineHeight: 1.2 }}>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="inline-link">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="inline-link">Privacy Policy</a>.
                    (opens in a new tab)
                  </span>
                </label>
                {errors.agree && <span className="error-message">{errors.agree}</span>}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLink, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <FaLink className="logo-icon" />
            <Link to="/" className="logo-text">
              OmsUrl
            </Link>
          </div>
          
          <nav className="nav-section">
            {user ? (
              <div className="user-nav">
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link">
                    Admin Panel
                  </Link>
                )}
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">
                  <FaSignInAlt /> Login
                </Link>
                <Link to="/register" className="register-btn">
                  <FaUserPlus /> Create Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
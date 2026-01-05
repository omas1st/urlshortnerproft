import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaTachometerAlt,
  FaLink,
  FaUserShield,
  FaDatabase,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import './AdminPanel.css';


const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUrls: 0,
    clicksToday: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAdminStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      // Response shape: { success: true, stats: {...}, recentActivity: [...] }
      const data = response.data || {};
      if (data.stats) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } else {
        // fallback: maybe controller returned flat stats fields
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalUrls: data.totalUrls ?? 0,
          clicksToday: data.clicksToday ?? data.todayVisitors ?? 0,
          activeUsers: data.activeUsers ?? 0
        });
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('fetchAdminStats error:', error?.response?.data || error.message || error);
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>
            <FaUserShield /> Admin Panel
          </h2>
          <p className="admin-email">{user?.email}</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item active">
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
            <FaUsers /> User Management
          </Link>
          <Link to="/admin/analytics" className="nav-item">
            <FaChartBar /> Analytics
          </Link>
          <Link to="/admin/urls" className="nav-item">
            <FaLink /> URL Management
          </Link>
          <Link to="/admin/settings" className="nav-item">
            <FaCog /> Settings
          </Link>
          <Link to="/admin/logs" className="nav-item">
            <FaDatabase /> System Logs
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="container">
            <h1>Admin Dashboard</h1>
            <div className="header-actions">
              <button className="refresh-btn" onClick={fetchAdminStats}>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Stats Overview */}
          <section className="admin-stats">
            <div className="stats-grid">
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaLink />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalUrls}</h3>
                  <p>Total URLs</p>
                </div>
              </div>
              
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaChartBar />
                </div>
                <div className="stat-info">
                  <h3>{stats.clicksToday ?? stats.todayVisitors ?? 0}</h3>
                  <p>Today's Visitors</p>
                </div>
              </div>
              
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h3>{stats.activeUsers}</h3>
                  <p>Active Users (24h)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="recent-activity">
            <h2 className="section-title">
              <FaExclamationTriangle /> Recent Activity
            </h2>
            
            {recentActivity.length === 0 ? (
              <p className="no-activity">No recent activity</p>
            ) : (
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'registration' && <FaUsers />}
                      {activity.type === 'url_created' && <FaLink />}
                      {activity.type === 'warning' && <FaExclamationTriangle />}
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="admin-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/admin/users" className="action-card admin-action">
                <FaUsers />
                <h3>Manage Users</h3>
                <p>View, edit, and manage user accounts</p>
              </Link>
              
              <Link to="/admin/urls" className="action-card admin-action">
                <FaLink />
                <h3>Manage URLs</h3>
                <p>Monitor and manage all shortened URLs</p>
              </Link>
              
              <Link to="/admin/analytics" className="action-card admin-action">
                <FaChartBar />
                <h3>System Analytics</h3>
                <p>View system-wide analytics and reports</p>
              </Link>
              
              <Link to="/admin/settings" className="action-card admin-action">
                <FaCog />
                <h3>System Settings</h3>
                <p>Configure system settings and preferences</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

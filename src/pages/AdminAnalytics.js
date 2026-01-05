import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsChart from '../components/AnalyticsChart';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaArrowLeft, 
  FaChartBar, 
  FaUsers, 
  FaLink,
  FaMousePointer,
  FaCalendar,
  FaDownload,
  FaServer,
  FaDatabase,
  FaUserPlus,
  FaClock,
  FaCog
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = { range: timeRange };
      if (useCustomDate && timeRange === 'custom') {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }

      const response = await api.get('/admin/analytics', { params });
      const data = response.data || {};
      setAnalyticsData(data.analytics || data);
    } catch (error) {
      console.error('fetchAdminAnalytics error:', error?.response?.data || error.message || error);
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, useCustomDate, startDate, endDate]);

  useEffect(() => {
    fetchAdminAnalytics();
  }, [fetchAdminAnalytics]);

  const handleExport = async () => {
    try {
      const params = { range: timeRange };
      if (useCustomDate && timeRange === 'custom') {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }

      const response = await api.get('/admin/analytics/export', {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('export error:', error?.response?.data || error.message || error);
      toast.error('Failed to export data');
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setUseCustomDate(range === 'custom');
    
    // Set default dates for predefined ranges
    const today = new Date();
    switch(range) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case '7days':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        setStartDate(weekAgo);
        setEndDate(today);
        break;
      case '30days':
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        setStartDate(monthAgo);
        setEndDate(today);
        break;
      case '90days':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        setStartDate(threeMonthsAgo);
        setEndDate(today);
        break;
      default:
        // Keep current dates for custom
        if (range !== 'custom') {
          setUseCustomDate(false);
        }
    }
  };

  const handleCustomDateApply = () => {
    if (startDate > endDate) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setUseCustomDate(true);
    fetchAdminAnalytics();
    toast.success('Custom date range applied');
  };

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '180days', label: 'Last 6 Months' },
    { value: '365days', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !analyticsData) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading admin analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics-page">
      <aside className="admin-sidebar">
        {/* Same sidebar as AdminPanel */}
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="container">
            <div className="header-content">
              <div className="back-section">
                <Link to="/admin" className="back-btn">
                  <FaArrowLeft /> Back to Dashboard
                </Link>
              </div>
              
              <div className="title-section">
                <h1>
                  <FaChartBar /> Admin Analytics
                </h1>
              </div>
              
              <div className="header-actions">
                <button onClick={handleExport} className="export-btn">
                  <FaDownload /> Export Data
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Time Range Selector */}
          <div className="controls-section">
            <div className="time-range-selector">
              <label>
                <FaCalendar /> Time Range:
              </label>
              <select 
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {timeRange === 'custom' && (
            <div className="custom-date-range-picker">
              <div className="date-inputs">
                <div className="date-input">
                  <label><FaCalendar /> From:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate}
                    dateFormat="MMMM d, yyyy"
                    className="date-picker-input"
                  />
                </div>
                <div className="date-input">
                  <label><FaCalendar /> To:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    className="date-picker-input"
                  />
                </div>
                <button onClick={handleCustomDateApply} className="apply-date-btn">
                  Apply Dates
                </button>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <section className="admin-stats-overview">
            <div className="stats-grid">
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h3>{analyticsData?.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaLink />
                </div>
                <div className="stat-info">
                  <h3>{analyticsData?.totalUrls || 0}</h3>
                  <p>Total URLs</p>
                </div>
              </div>
              
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaMousePointer />
                </div>
                <div className="stat-info">
                  <h3>{analyticsData?.totalClicks || 0}</h3>
                  <p>Total Clicks</p>
                </div>
              </div>
              
              <div className="stat-card admin-stat">
                <div className="stat-icon">
                  <FaUserPlus />
                </div>
                <div className="stat-info">
                  <h3>{analyticsData?.recentUsers?.length || 0}</h3>
                  <p>Recent Signups</p>
                </div>
              </div>
            </div>
          </section>

          {/* Growth Charts */}
          <section className="charts-section">
            <div className="charts-grid">
              {/* Traffic Growth */}
              <div className="chart-card">
                <AnalyticsChart
                  data={analyticsData?.clicksOverTime || {}}
                  type="clicks"
                  title="Traffic Growth"
                  timeRange={timeRange}
                />
              </div>
              
              {/* User Registrations */}
              <div className="chart-card">
                <AnalyticsChart
                  data={analyticsData?.userRegistrations || {}}
                  type="clicks"
                  title="User Registrations"
                  timeRange={timeRange}
                />
              </div>
            </div>
          </section>

          {/* Detailed Tables */}
          <section className="detailed-tables">
            <div className="tables-grid">
              {/* Top URLs */}
              <div className="table-card">
                <h3><FaLink /> Top URLs</h3>
                {analyticsData?.topUrls?.length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Short URL</th>
                          <th>Clicks</th>
                          <th>Owner</th>
                          <th>Destination</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.topUrls.map((url, index) => (
                          <tr key={index}>
                            <td>{`.../${url.shortId}`}</td>
                            <td>{url.clicks}</td>
                            <td>{url.owner}</td>
                            <td>{url.destinationUrl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No URL data available</p>
                )}
              </div>
              
              {/* Recent Users */}
              <div className="table-card">
                <h3><FaUsers /> Recent Users</h3>
                {analyticsData?.recentUsers?.length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentUsers.map((user, index) => (
                          <tr key={index}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{new Date(user.joined).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No user data available</p>
                )}
              </div>
              
              {/* Recent URLs */}
              <div className="table-card">
                <h3><FaLink /> Recent URLs</h3>
                {analyticsData?.recentUrls?.length > 0 ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Short URL</th>
                          <th>Destination</th>
                          <th>Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentUrls.map((url, index) => (
                          <tr key={index}>
                            <td>{`.../${url.shortId}`}</td>
                            <td>{url.destination}</td>
                            <td>{url.owner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">No URL data available</p>
                )}
              </div>
              
              {/* System Health */}
              <div className="table-card">
                <h3><FaCog /> System Health</h3>
                <div className="table-container">
                  <table>
                    <tbody>
                      <tr>
                        <td><FaServer /> Server Uptime</td>
                        <td>{analyticsData?.systemHealth?.uptime ? formatUptime(analyticsData.systemHealth.uptime) : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><FaDatabase /> Memory Usage</td>
                        <td>{analyticsData?.systemHealth?.memoryUsage ? formatBytes(analyticsData.systemHealth.memoryUsage.heapUsed) : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><FaUsers /> Active Sessions</td>
                        <td>{analyticsData?.systemHealth?.activeConnections || 0}</td>
                      </tr>
                      <tr>
                        <td><FaClock /> Last Updated</td>
                        <td>{new Date().toLocaleTimeString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
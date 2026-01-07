// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import UrlShortener from '../components/UrlShortener';
import NotificationBell from '../components/NotificationBell';
import QRCodesPopup from '../components/QRCodesPopup'; // NEW IMPORT
import BrandLinkPopup from '../components/BrandLinkPopup'; // NEW IMPORT
import { 
  FaSignOutAlt, 
  FaLink, 
  FaChartBar, 
  FaQrcode,
  FaTachometerAlt,
  FaCalendarDay,
  FaCalendarAlt,
  FaChevronRight,
  FaGlobe,  // ADDED: FaGlobe icon import
  FaShoppingCart  // ADDED: FaShoppingCart icon for Buy Domain
} from 'react-icons/fa';
import { FiCopy, FiEye, FiExternalLink } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    todayClicks: 0,
    activeUrls: 0
  });
  const [recentUrls, setRecentUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showQRCodesPopup, setShowQRCodesPopup] = useState(false); // NEW STATE
  const [showBrandLinkPopup, setShowBrandLinkPopup] = useState(false); // ADDED: Brand Link popup state
  const [qrCodesData, setQrCodesData] = useState([]); // NEW STATE
  const [loadingQRCodes, setLoadingQRCodes] = useState(false); // NEW STATE
  const headerRef = useRef(null);

  // Get domain affiliate link from environment variables
  const domainAffiliateLink = process.env.REACT_APP_DOMAIN_AFFILIATE_LINK || '#';

  /**
   * getBackendOrigin
   * Prefer explicit REACT_APP_BACKEND_URL, otherwise attempt sensible dev fallback
   */
  const getBackendOrigin = useCallback(() => {
    try {
      if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
      }
      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:3000';
      // If frontend is at :3000, assume backend at :5000 (dev fallback)
      if (origin.includes(':3000')) return origin.replace(':3000', ':5000');
      return origin; // best-effort fallback
    } catch (e) {
      return 'http://localhost:5000';
    }
  }, []);

  /**
   * getShortUrl
   * Prefer server provided shortUrl, otherwise construct using backend origin + shortId
   */
  const getShortUrl = useCallback((url) => {
    if (!url) return '';
    if (url.shortUrl) return url.shortUrl;
    if (url.shortId) return `${getBackendOrigin()}/s/${url.shortId}`;
    return '';
  }, [getBackendOrigin]);

  /**
   * fetchDashboardData
   * Wrapped in useCallback so it can be safely used in useEffect deps
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch stats
      const statsRes = await api.get('/urls/dashboard-stats');
      if (statsRes.data && !statsRes.data.success) {
        throw new Error(statsRes.data.message || 'Failed to load stats');
      }
      
      // If statsRes.data is an object with stats, use that, otherwise use the response data directly
      if (statsRes.data && typeof statsRes.data === 'object') {
        if (statsRes.data.totalUrls !== undefined) {
          // Data is already in the expected format
          setStats(statsRes.data);
        } else if (statsRes.data.data) {
          // Data is wrapped in data property
          setStats(statsRes.data.data);
        } else if (statsRes.data.stats) {
          // Data is in stats property
          setStats(statsRes.data.stats);
        } else {
          // Try to extract from response
          const { totalUrls = 0, totalClicks = 0, todayClicks = 0, activeUrls = 0 } = statsRes.data;
          setStats({ totalUrls, totalClicks, todayClicks, activeUrls });
        }
      }
      
      // Fetch recent URLs
      const urlsRes = await api.get('/urls/recent-urls');
      if (urlsRes.data && !urlsRes.data.success) {
        throw new Error(urlsRes.data.message || 'Failed to load recent URLs');
      }
      
      let mapped = [];
      // server returns { success:true, data: [...] } as per your controller
      if (Array.isArray(urlsRes.data)) {
        mapped = urlsRes.data;
      } else if (urlsRes.data && Array.isArray(urlsRes.data.urls)) {
        mapped = urlsRes.data.urls;
      } else if (urlsRes.data && Array.isArray(urlsRes.data.data)) {
        mapped = urlsRes.data.data;
      } else if (urlsRes.data && Array.isArray(urlsRes.data)) {
        mapped = urlsRes.data;
      }

      // Defensive: ensure each url has a shortUrl field client-side
      const normalized = mapped.map(u => {
        if (!u.shortUrl && u.shortId) {
          return { ...u, shortUrl: `${getBackendOrigin()}/s/${u.shortId}` };
        }
        return u;
      });

      setRecentUrls(normalized);
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Set default values on error
      setStats({
        totalUrls: 0,
        totalClicks: 0,
        todayClicks: 0,
        activeUrls: 0
      });
      setRecentUrls([]);
    } finally {
      setLoading(false);
    }
  }, [getBackendOrigin]);

  /**
   * fetchQRCodesData - NEW FUNCTION
   * Fetch all user URLs with QR codes
   */
  const fetchQRCodesData = useCallback(async () => {
    try {
      setLoadingQRCodes(true);
      const response = await api.get('/urls/user-urls?limit=1000');
      
      let urls = [];
      if (response.data && response.data.success) {
        if (Array.isArray(response.data.urls)) {
          urls = response.data.urls;
        } else if (Array.isArray(response.data.data)) {
          urls = response.data.data;
        } else if (Array.isArray(response.data)) {
          urls = response.data;
        }
      }
      
      // Filter URLs that have QR codes or generateQrCode enabled
      const urlsWithQRCodes = urls.filter(url => 
        url.qrCodeData || url.generateQrCode || url.hasQrCode
      ).map(url => ({
        ...url,
        shortUrl: url.shortUrl || getShortUrl(url),
        qrCodeData: url.qrCodeData || null
      }));
      
      setQrCodesData(urlsWithQRCodes);
      return urlsWithQRCodes;
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
      toast.error('Failed to load QR codes');
      return [];
    } finally {
      setLoadingQRCodes(false);
    }
  }, [getShortUrl]);

  /**
   * handleOpenQRCodesPopup - NEW FUNCTION
   */
  const handleOpenQRCodesPopup = async () => {
    setShowQRCodesPopup(true);
    // Fetch QR codes data when popup opens
    await fetchQRCodesData();
  };

  /**
   * handleCloseQRCodesPopup - NEW FUNCTION
   */
  const handleCloseQRCodesPopup = () => {
    setShowQRCodesPopup(false);
  };

  // Handle scroll to show/hide header
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and past 100px - hide header
      setHeaderVisible(false);
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up - show header
      setHeaderVisible(true);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    // call the stable fetchDashboardData
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handleLogout = () => {
    logout();
  };

  /**
   * handleUrlGenerated
   * Ensure newly generated URL has shortUrl (if backend didn't provide it)
   */
  const handleUrlGenerated = useCallback((newUrl) => {
    const normalized = newUrl.shortUrl ? newUrl : { ...newUrl, shortUrl: (newUrl.shortId ? `${getBackendOrigin()}/s/${newUrl.shortId}` : '') };
    setRecentUrls(prev => [normalized, ...prev.slice(0, 4)]);
    setStats(prev => ({
      ...prev,
      totalUrls: (prev.totalUrls || 0) + 1,
      activeUrls: (prev.activeUrls || 0) + 1
    }));
    
    // If the new URL has a QR code, add it to the QR codes data
    if (newUrl.qrCodeData || newUrl.generateQrCode) {
      setQrCodesData(prev => [{
        ...newUrl,
        shortUrl: newUrl.shortUrl || getShortUrl(newUrl),
        qrCodeData: newUrl.qrCodeData || null
      }, ...prev]);
    }
  }, [getBackendOrigin, getShortUrl]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('URL copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy URL');
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="container">
            <div className="header-content">
              <h1><FaTachometerAlt /> Dashboard</h1>
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="container">
            <div className="loading">Loading dashboard data...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Dashboard Header (now in-flow as first section) */}
      <header 
        ref={headerRef}
        className={`dashboard-header ${headerVisible ? 'header-visible' : 'header-hidden'}`}
      >
        <div className="container">
          <div className="header-content">
            <div className="welcome-section">
              <h1>
                <FaTachometerAlt /> Dashboard
              </h1>
              <p className="welcome-message">
                Welcome back, <span className="username">{user?.username || user?.email}</span>!
              </p>
            </div>
            
            <div className="header-actions">
              <NotificationBell />
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* A wrapper so scaling/zoom only affects dashboard content */}
      <main className="dashboard-main">
        <div className="dashboard-inner">
          <div className="container">
            {error && (
              <div className="error-banner">
                <p>{error}</p>
                <button onClick={fetchDashboardData} className="retry-btn">
                  Retry
                </button>
              </div>
            )}
            
            {/* URL Shortener Section - First */}
            <section className="url-shortener-section">
              <h2 className="section-title">Shorten New URL</h2>
              <UrlShortener onGenerate={handleUrlGenerated} isDashboard={true} />
            </section>

            {/* Quick Actions - Second */}
            <section className="quick-actions-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="quick-actions-grid">
                <Link to="/generated-urls" className="quick-action-btn">
                  <div className="quick-action-icon">
                    <FaLink />
                  </div>
                  <span className="quick-action-text">All URLs</span>
                </Link>
                
                <Link to="/analytics" className="quick-action-btn">
                  <div className="quick-action-icon">
                    <FaChartBar />
                  </div>
                  <span className="quick-action-text">Analytics</span>
                </Link>
                
                {/* Updated QR Codes Button */}
                <button 
                  className="quick-action-btn"
                  onClick={handleOpenQRCodesPopup}
                >
                  <div className="quick-action-icon">
                    <FaQrcode />
                  </div>
                  <span className="quick-action-text">QR Codes</span>
                </button>
                
                {/* ADDED: Brand Link Button */}
                <button 
                  className="quick-action-btn"
                  onClick={() => setShowBrandLinkPopup(true)}
                >
                  <div className="quick-action-icon">
                    <FaGlobe />
                  </div>
                  <span className="quick-action-text">Brand Link</span>
                </button>
                
                {/* ADDED: Buy Domain Button */}
                <a 
                  href={domainAffiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quick-action-btn"
                >
                  <div className="quick-action-icon">
                    <FaShoppingCart />
                  </div>
                  <span className="quick-action-text">Buy Domain</span>
                </a>
                
                <div className="quick-action-btn" onClick={() => document.querySelector('.url-shortener-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <div className="quick-action-icon">
                    <FaLink />
                  </div>
                  <span className="quick-action-text">Shorten</span>
                </div>
              </div>
            </section>

            {/* Stats Overview - Third */}
            <section className="stats-overview-section">
              <h2 className="section-title">Stats Overview</h2>
              <div className="stats-compact-grid">
                <div className="compact-stat">
                  <div className="compact-stat-icon total-urls">
                    <FaLink />
                  </div>
                  <div className="compact-stat-content">
                    <h3>{stats.totalUrls.toLocaleString()}</h3>
                    <p>Total URLs</p>
                  </div>
                </div>
                
                <div className="compact-stat">
                  <div className="compact-stat-icon total-clicks">
                    <FaChartBar />
                  </div>
                  <div className="compact-stat-content">
                    <h3>{stats.totalClicks.toLocaleString()}</h3>
                    <p>Total Clicks</p>
                  </div>
                </div>
                
                <div className="compact-stat">
                  <div className="compact-stat-icon today-clicks">
                    <FaCalendarDay />
                  </div>
                  <div className="compact-stat-content">
                    <h3>{stats.todayClicks.toLocaleString()}</h3>
                    <p>Today's Clicks</p>
                  </div>
                </div>
                
                <div className="compact-stat">
                  <div className="compact-stat-icon active-urls">
                    <FaLink />
                  </div>
                  <div className="compact-stat-content">
                    <h3>{stats.activeUrls.toLocaleString()}</h3>
                    <p>Active URLs</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent URLs - Fourth */}
            <section className="recent-urls-section">
              <div className="section-header">
                <h2 className="section-title">Recent URLs</h2>
                <Link to="/generated-urls" className="view-all-link">
                  View All <FaChevronRight />
                </Link>
              </div>
              
              {recentUrls.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FaLink />
                  </div>
                  <p>No URLs generated yet</p>
                  <p className="empty-state-subtext">Create your first short URL above!</p>
                </div>
              ) : (
                <div className="recent-urls-list">
                  {recentUrls.map(url => {
                    const shortUrl = getShortUrl(url);
                    const displayShortUrl = shortUrl.replace(/^https?:\/\//, '');
                    
                    return (
                      <div key={url._id || url.id} className="recent-url-card">
                        <div className="recent-url-header">
                          <div className="recent-url-short">
                            <a 
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="short-url-display"
                            >
                              {displayShortUrl}
                              <FiExternalLink className="external-link-icon" />
                            </a>
                            <button 
                              onClick={() => copyToClipboard(shortUrl)}
                              className="copy-btn"
                              title="Copy URL"
                            >
                              <FiCopy />
                            </button>
                          </div>
                          <div className="recent-url-clicks">
                            <span className="clicks-count">{url.clicks || 0}</span>
                            <span className="clicks-label">clicks</span>
                          </div>
                        </div>
                        
                        <div className="recent-url-destination">
                          <span className="destination-label">Destination:</span>
                          <a 
                            href={url.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="destination-url"
                            title={url.destinationUrl}
                          >
                            {url.destinationUrl ? 
                              url.destinationUrl.replace(/^https?:\/\//, '').substring(0, 40) + 
                              (url.destinationUrl.length > 40 ? '...' : '') : 
                              'N/A'
                            }
                          </a>
                        </div>
                        
                        <div className="recent-url-footer">
                          <div className="recent-url-date">
                            <FaCalendarAlt />
                            <span>{url.createdAt ? new Date(url.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="recent-url-actions">
                            <Link 
                              to={`/analytics?url=${url._id || url.id}`}
                              className="analytics-btn"
                            >
                              <FiEye /> Stats
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* QR Codes Popup */}
      {showQRCodesPopup && (
        <QRCodesPopup
          qrCodesData={qrCodesData}
          loading={loadingQRCodes}
          onClose={handleCloseQRCodesPopup}
          onRefresh={fetchQRCodesData}
        />
      )}

      {/* ADDED: Brand Link Popup */}
      {showBrandLinkPopup && (
        <BrandLinkPopup onClose={() => setShowBrandLinkPopup(false)} />
      )}
    </div>
  );
};

export default Dashboard;
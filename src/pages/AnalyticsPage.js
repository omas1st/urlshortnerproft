import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AnalyticsChart from '../components/AnalyticsChart';
import {
  FaArrowLeft,
  FaChartBar,
  FaUserClock,
  FaUsers,
  FaMousePointer,
  FaHistory,
  FaCalendar,
  FaDownload,
  FaFilter,
  FaExclamationTriangle,
  FaSync,
  FaClock,
  FaGlobe,
  FaMobile,
  FaDesktop,
  FaTablet,
  FaScroll,
  FaHourglassHalf,
  FaExternalLinkAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [searchParams] = useSearchParams();
  const urlId = searchParams.get('url');

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
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [userUrls, setUserUrls] = useState([]);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [detailedMetrics, setDetailedMetrics] = useState({});

  const activeRequest = useRef(null);
  const MAX_RETRIES = 2;

  // Fetch user URLs
  const fetchUserUrls = useCallback(async () => {
    try {
      const res = await api.get('/urls/user-urls');
      const body = res.data;
      const urls = body?.urls ?? body?.data ?? (Array.isArray(body) ? body : []);
      setUserUrls(Array.isArray(urls) ? urls : []);
      return urls;
    } catch (err) {
      console.warn('fetchUserUrls failed:', err?.message, 'trying /urls/recent-urls fallback');
      try {
        const res = await api.get('/urls/recent-urls');
        const body = res.data;
        const urls = body?.data ?? body?.urls ?? (Array.isArray(body) ? body : []);
        setUserUrls(Array.isArray(urls) ? urls : []);
        return urls;
      } catch (err2) {
        console.error('Both user-urls and recent-urls failed:', err2?.message);
        setUserUrls([]);
        return [];
      }
    }
  }, []);

  // Format date for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Enhanced Normalization helper - with proper handling for all time ranges and both overall/url-specific data
  const normalizeAnalytics = useCallback((raw = {}, isOverall = false) => {
    console.log('Normalizing analytics data:', { raw, isOverall });
    
    // Clone the raw data
    const normalized = { ...raw };

    // ---------- Clicks over time ----------
    let labels = [];
    let values = [];

    if (isOverall) {
      // Handle overall analytics data structure
      if (raw.clicksOverTime && Array.isArray(raw.clicksOverTime.labels) && Array.isArray(raw.clicksOverTime.values)) {
        labels = raw.clicksOverTime.labels.slice();
        values = raw.clicksOverTime.values.map(v => Number(v || 0));
      } else if (Array.isArray(raw.timeSeries) && raw.timeSeries.length > 0) {
        raw.timeSeries.forEach(item => {
          let label = item.label ?? item.date ?? item._id ?? item.x;
          let value = (item.value ?? item.count ?? item.y ?? item.total) || 0;

          if (typeof label === 'string') {
            // Handle different date formats
            if (/^\d{4}-\d{2}$/.test(label)) { // YYYY-MM format (monthly)
              const [year, month] = label.split('-');
              label = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } else if (/^\d{4}-\d{2}-\d{2}/.test(label)) { // YYYY-MM-DD format
              try { label = new Date(label).toLocaleDateString(); } catch {}
            }
          } else if (label instanceof Date) {
            label = label.toLocaleDateString();
          }
          labels.push(String(label ?? ''));
          values.push(Number(value));
        });
      }
    } else {
      // Handle URL-specific data structure
      if (Array.isArray(raw.timeSeries) && raw.timeSeries.length > 0) {
        raw.timeSeries.forEach(item => {
          let label = item.label ?? item.date ?? item._id ?? item.x;
          let value = (item.value ?? item.count ?? item.y ?? item.total) || 0;

          if (typeof label === 'string') {
            // Handle different date formats
            if (/^\d{4}-\d{2}$/.test(label)) { // YYYY-MM format (monthly)
              const [year, month] = label.split('-');
              label = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            } else if (/^\d{4}-\d{2}-\d{2}/.test(label)) { // YYYY-MM-DD format
              try { label = new Date(label).toLocaleDateString(); } catch {}
            }
          } else if (label instanceof Date) {
            label = label.toLocaleDateString();
          }
          labels.push(String(label ?? ''));
          values.push(Number(value));
        });
      }
      else if (raw.clicksOverTime && Array.isArray(raw.clicksOverTime.labels) && Array.isArray(raw.clicksOverTime.values)) {
        labels = raw.clicksOverTime.labels.slice();
        values = raw.clicksOverTime.values.map(v => Number(v || 0));
      }
      else if (Array.isArray(raw.recentClicks) && raw.recentClicks.length > 0) {
        const map = {};
        raw.recentClicks.forEach(c => {
          const t = c.timestamp ? new Date(c.timestamp) : new Date();
          const day = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
          map[day] = (map[day] || 0) + 1;
        });
        const entries = Object.entries(map).sort((a,b) => new Date(a[0]) - new Date(b[0]));
        entries.forEach(([day, cnt]) => {
          labels.push(new Date(day).toLocaleDateString());
          values.push(cnt);
        });
      }
    }

    normalized.clicksOverTime = { labels, values };

    // ---------- Top countries ----------
    let countriesData = [];
    let countries = [];
    let visits = [];
    
    if (isOverall) {
      // Handle overall analytics country data
      if (raw.topCountries && raw.topCountries.rawData) {
        countriesData = raw.topCountries.rawData;
      } else if (raw.topCountries && Array.isArray(raw.topCountries)) {
        countriesData = raw.topCountries;
      } else if (raw.countries && Array.isArray(raw.countries)) {
        countriesData = raw.countries;
      } else if (typeof raw.topCountries === 'object' && raw.topCountries !== null) {
        if (Array.isArray(raw.topCountries.countries) && Array.isArray(raw.topCountries.visits)) {
          countriesData = raw.topCountries.countries.map((country, index) => ({
            country,
            visits: raw.topCountries.visits[index] || 0
          }));
        } else if (raw.topCountries.rawData && Array.isArray(raw.topCountries.rawData)) {
          countriesData = raw.topCountries.rawData;
        }
      }
    } else {
      // Handle URL-specific country data
      if (raw.topCountries && raw.topCountries.rawData) {
        countriesData = raw.topCountries.rawData;
      } else if (raw.topCountries && Array.isArray(raw.topCountries)) {
        countriesData = raw.topCountries;
      } else if (raw.countries && Array.isArray(raw.countries)) {
        countriesData = raw.countries;
      } else if (typeof raw.topCountries === 'object' && raw.topCountries !== null) {
        if (Array.isArray(raw.topCountries.countries) && Array.isArray(raw.topCountries.visits)) {
          countriesData = raw.topCountries.countries.map((country, index) => ({
            country,
            visits: raw.topCountries.visits[index] || 0
          }));
        }
      }
    }
    
    // Process countries data
    if (Array.isArray(countriesData) && countriesData.length > 0) {
      countriesData.forEach(c => {
        if (!c) return;
        const name = c.country ?? c._id ?? c.name ?? c.countryName ?? c.country_code ?? 'Unknown';
        const cnt = Number(c.clicks ?? c.count ?? c.visits ?? c.value ?? 0);
        if (name && cnt > 0) {
          countries.push(String(name));
          visits.push(cnt);
        }
      });
    } else if (typeof countriesData === 'object' && Object.keys(countriesData).length > 0) {
      Object.entries(countriesData).forEach(([k, v]) => {
        if (k && v > 0) {
          countries.push(k);
          visits.push(Number(v || 0));
        }
      });
    }
    
    // Sort by visits
    const combined = countries.map((c, i) => ({ country: c, visits: visits[i] }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10); // Limit to top 10
    
    normalized.topCountries = {
      countries: combined.map(c => c.country),
      visits: combined.map(c => c.visits),
      rawData: combined
    };

    // ---------- Device distribution ----------
    let devicesArr = [0, 0, 0];
    
    // Handle device distribution for both overall and specific URLs
    if (raw.deviceDistribution && typeof raw.deviceDistribution === 'object') {
      const dd = raw.deviceDistribution;
      
      // Check if it's in the format { desktop: x, mobile: y, tablet: z }
      if (dd.desktop !== undefined || dd.mobile !== undefined || dd.tablet !== undefined) {
        devicesArr = [
          Number(dd.desktop || 0),
          Number(dd.mobile || 0),
          Number(dd.tablet || 0)
        ];
      }
      // Check if it's in the format { devices: [d, m, t] }
      else if (dd.devices && Array.isArray(dd.devices)) {
        devicesArr = dd.devices.map(v => Number(v || 0));
      }
    }
    // Handle legacy format where deviceDistribution might be an array
    else if (Array.isArray(raw.deviceDistribution) && raw.deviceDistribution.length >= 3) {
      devicesArr = raw.deviceDistribution.map(v => Number(v || 0));
    }
    
    normalized.deviceDistribution = { devices: devicesArr };

    // ---------- Engagement / bounce vs engaged ----------
    let bounced = 0;
    let engaged = 0;
    let bounceRate = 0;
    
    if (isOverall) {
      // Handle overall analytics engagement data
      if (raw.engagement && typeof raw.engagement === 'object') {
        bounced = Number(raw.engagement.bounced || raw.engagement.bounceCount || 0);
        engaged = Number(raw.engagement.engaged || raw.engagement.engagedCount || 0);
        bounceRate = Number(raw.engagement.bounceRate || 0);
      } else if (raw.bounced !== undefined || raw.engaged !== undefined) {
        bounced = Number(raw.bounced || 0);
        engaged = Number(raw.engaged || 0);
        bounceRate = raw.totalClicks ? (bounced / raw.totalClicks * 100) : 0;
      } else if (raw.bounceRate !== undefined && (raw.totalClicks !== undefined || raw.totalClicks === 0)) {
        const total = Number(raw.totalClicks || 0);
        bounceRate = Math.min(100, Math.max(0, Number(raw.bounceRate || 0)));
        bounced = Math.round(total * (bounceRate / 100));
        engaged = Math.max(0, total - bounced);
      }
    } else {
      if (raw.engagement && typeof raw.engagement === 'object') {
        bounced = Number(raw.engagement.bounced || raw.engagement.bounceCount || 0);
        engaged = Number(raw.engagement.engaged || raw.engagement.engagedCount || 0);
        bounceRate = Number(raw.engagement.bounceRate || 0);
      } else if (raw.bounced !== undefined || raw.engaged !== undefined) {
        bounced = Number(raw.bounced || 0);
        engaged = Number(raw.engaged || 0);
        bounceRate = raw.totalClicks ? (bounced / raw.totalClicks * 100) : 0;
      } else if (raw.bounceRate !== undefined && (raw.totalClicks !== undefined || raw.totalClicks === 0)) {
        const total = Number(raw.totalClicks || 0);
        bounceRate = Math.min(100, Math.max(0, Number(raw.bounceRate || 0)));
        bounced = Math.round(total * (bounceRate / 100));
        engaged = Math.max(0, total - bounced);
      }
    }
    
    normalized.engagement = { bounced, engaged, bounceRate };

    // ---------- Returning visitors ----------
    if (raw.returningVisitors !== undefined) {
      normalized.returningVisitors = Number(raw.returningVisitors || 0);
    } else if (raw.returningVisitorsCount !== undefined) {
      normalized.returningVisitors = Number(raw.returningVisitorsCount || 0);
    } else {
      normalized.returningVisitors = 0;
    }

    // recentClicks fallback
    if (isOverall) {
      normalized.recentClicks = Array.isArray(raw.recentClicks) ? raw.recentClicks : [];
    } else {
      normalized.recentClicks = Array.isArray(raw.recentClicks) ? raw.recentClicks : 
                               (Array.isArray(raw.recent_clicks) ? raw.recent_clicks : []);
    }

    // Keep some top-level convenience fields
    normalized.totalClicks = Number(raw.totalClicks || raw.total_clicks || 0);
    normalized.uniqueClicks = Number(raw.uniqueClicks || raw.unique_clicks || raw.uniqueVisitors || 0);
    
    // ---------- Detailed metrics ----------
    // Use backend data properly
    const detailedMetrics = raw.detailedMetrics || {};
    
    normalized.detailedMetrics = {
      avgTimeToClick: detailedMetrics.avgTimeToClick || 'N/A',
      avgScrollDepth: detailedMetrics.avgScrollDepth || 'N/A',
      peakHour: detailedMetrics.peakHour || 'N/A',
      topReferrer: detailedMetrics.topReferrer || 'Direct',
      avgSessionDuration: detailedMetrics.avgSessionDuration || 'N/A',
      conversionRate: detailedMetrics.conversionRate || '0%',
      pagesPerSession: detailedMetrics.pagesPerSession !== undefined ? 
        parseFloat(detailedMetrics.pagesPerSession) : 1.0
    };

    console.log('Normalized analytics data:', normalized);
    return normalized;
  }, []);

  // Fetch analytics for a specific url
  const fetchAnalyticsByUrl = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      if (activeRequest.current) {
        try { activeRequest.current.cancel('new analytics request'); } catch {}
      }

      const params = { range: timeRange };
      if (useCustomDate) {
        params.startDate = formatDateForAPI(startDate);
        params.endDate = formatDateForAPI(endDate);
        params.range = 'custom';
      }

      console.log('Fetching analytics for URL:', { id, params });

      const CancelToken = api.CancelToken || null;
      let res;
      if (CancelToken) {
        const source = CancelToken.source();
        activeRequest.current = source;
        res = await api.get(`/urls/${id}/analytics`, { 
          params,
          cancelToken: source.token 
        });
      } else {
        res = await api.get(`/urls/${id}/analytics`, { params });
      }

      const body = res.data;
      console.log('Analytics response:', body);
      
      const rawAnalytics = body?.analytics ?? body?.data ?? body;
      const normalized = normalizeAnalytics(rawAnalytics, false);
      setAnalyticsData(normalized);
      
      // Extract detailed metrics from analytics response
      if (body?.analytics?.detailedMetrics) {
        setDetailedMetrics(body.analytics.detailedMetrics);
      } else if (body?.detailedMetrics) {
        setDetailedMetrics(body.detailedMetrics);
      } else if (rawAnalytics?.detailedMetrics) {
        setDetailedMetrics(rawAnalytics.detailedMetrics);
      }

      // set selectedUrl if present
      if (userUrls.length > 0) {
        const found = userUrls.find(u => String(u._id) === String(id) || String(u.id) === String(id));
        if (found) setSelectedUrl(found);
      }
      
      if (!body.success && body.message) {
        toast.error(body.message);
      } else {
        toast.success('Analytics loaded successfully');
      }
    } catch (err) {
      if (api.isCancel && api.isCancel(err)) {
        console.warn('analytics request cancelled');
      } else {
        console.error('fetchAnalyticsByUrl error:', err);
        let message = 'Failed to load analytics';
        if (err.code === 'ECONNABORTED') message = 'Request timeout';
        else if (err.response) message = err.response.data?.message || `Server error ${err.response.status}`;
        else if (err.message) message = err.message;
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
      activeRequest.current = null;
    }
  }, [normalizeAnalytics, timeRange, useCustomDate, startDate, endDate, userUrls]);

  // Fetch overall analytics (dashboard stats)
  const fetchOverallAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { range: timeRange };
      if (useCustomDate) {
        params.startDate = formatDateForAPI(startDate);
        params.endDate = formatDateForAPI(endDate);
        params.range = 'custom';
      }

      console.log('Fetching overall analytics with params:', params);

      // Try multiple endpoints for overall analytics
      let res;
      let rawAnalytics;
      
      try {
        // First try the overall-analytics endpoint
        res = await api.get('/urls/overall-analytics', { params });
        const body = res.data;
        console.log('Overall analytics response from /overall-analytics:', body);
        
        rawAnalytics = body?.analytics ?? body?.data ?? body;
      } catch (err) {
        console.log('Fallback to dashboard-stats endpoint:', err?.message);
        // Fallback to dashboard-stats endpoint
        res = await api.get('/urls/dashboard-stats', { params });
        const body = res.data;
        console.log('Overall analytics response from /dashboard-stats:', body);
        
        rawAnalytics = body?.analytics ?? body?.data ?? body;
      }
      
      const normalized = normalizeAnalytics(rawAnalytics, true);
      setAnalyticsData(normalized);
      setSelectedUrl(null);
      
      // Extract detailed metrics
      if (rawAnalytics?.detailedMetrics) {
        setDetailedMetrics(rawAnalytics.detailedMetrics);
      } else if (rawAnalytics?.analytics?.detailedMetrics) {
        setDetailedMetrics(rawAnalytics.analytics.detailedMetrics);
      }
      
      if (res.data && !res.data.success && res.data.message) {
        toast.error(res.data.message);
      } else {
        toast.success('Overall analytics loaded');
      }
    } catch (err) {
      console.error('fetchOverallAnalytics error:', err);
      let message = 'Failed to load overall analytics';
      if (err.code === 'ECONNABORTED') message = 'Request timeout';
      else if (err.response) message = err.response.data?.message || `Server error ${err.response.status}`;
      else if (err.message) message = err.message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [normalizeAnalytics, timeRange, useCustomDate, startDate, endDate]);

  // initial load of user urls
  useEffect(() => {
    fetchUserUrls();
  }, [fetchUserUrls]);

  // Fetch analytics when urlId/timeRange/retryCount or dates change
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setError('');
      if (urlId) {
        await fetchAnalyticsByUrl(urlId);
      } else {
        await fetchOverallAnalytics();
      }
      if (cancelled && activeRequest.current) {
        try { activeRequest.current.cancel('cleanup'); } catch {}
      }
    };
    run();
    return () => {
      cancelled = true;
      if (activeRequest.current) {
        try { activeRequest.current.cancel('component cleanup'); } catch {}
      }
    };
  }, [urlId, timeRange, retryCount, useCustomDate, startDate, endDate, fetchAnalyticsByUrl, fetchOverallAnalytics]);

  const handleExport = useCallback(async () => {
    try {
      if (!urlId) {
        // For overall analytics, try to export aggregated data
        const params = { format: 'csv', range: timeRange, type: 'overall' };
        if (useCustomDate) {
          params.startDate = formatDateForAPI(startDate);
          params.endDate = formatDateForAPI(endDate);
        }
        
        const res = await api.get('/analytics/export/overall', { 
          params, 
          responseType: 'blob', 
          timeout: 60000 
        });
        
        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `overall-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Overall analytics exported successfully');
        return;
      }
      
      // For specific URL
      const params = { format: 'csv', range: timeRange };
      if (useCustomDate) {
        params.startDate = formatDateForAPI(startDate);
        params.endDate = formatDateForAPI(endDate);
      }
      
      const res = await api.get(`/urls/${urlId}/export`, { 
        params, 
        responseType: 'blob', 
        timeout: 60000 
      });
      
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `analytics-${selectedUrl?.shortId || 'overall'}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export data');
    }
  }, [urlId, timeRange, useCustomDate, startDate, endDate, selectedUrl]);

  const handleRetry = useCallback(() => {
    setRetryCount(c => c + 1);
    setError('');
    fetchUserUrls();
  }, [fetchUserUrls]);

  const handleCustomDateApply = () => {
    if (startDate > endDate) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setUseCustomDate(true);
    setTimeRange('custom');
    toast.success('Custom date range applied');
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setUseCustomDate(false);
    
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
      case '180days':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
        setStartDate(sixMonthsAgo);
        setEndDate(today);
        break;
      case '365days':
        const yearAgo = new Date();
        yearAgo.setDate(yearAgo.getDate() - 365);
        setStartDate(yearAgo);
        setEndDate(today);
        break;
      case 'all':
        // For all time, set start date to a very old date
        setStartDate(new Date(0));
        setEndDate(today);
        break;
      default:
        // Keep current dates for custom
        if (range !== 'custom') {
          setUseCustomDate(false);
        }
    }
  };

  const timeRangeOptions = useMemo(() => [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '180days', label: 'Last 6 Months' },
    { value: '365days', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ], []);

  const getDisplayTimeRange = () => {
    if (useCustomDate && timeRange === 'custom') {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return timeRangeOptions.find(opt => opt.value === timeRange)?.label || timeRange;
  };

  // Loading UI when no data yet
  if (loading && !analyticsData) {
    return (
      <div className="analytics-page">
        <header className="analytics-header">
          <div className="container">
            <div className="header-content">
              <div className="back-section"><Link to="/dashboard" className="back-btn"><FaArrowLeft /> Back to Dashboard</Link></div>
              <div className="title-section"><h1><FaChartBar /> Analytics</h1></div>
            </div>
          </div>
        </header>
        <main className="analytics-main">
          <div className="container">
            <div className="loading-container">
              <div className="spinner" />
              <h3>Loading Analytics Data...</h3>
              <p>This may take a few moments</p>
              <button onClick={handleRetry} className="retry-btn loading-retry" disabled={retryCount > MAX_RETRIES}>
                <FaSync /> {retryCount > MAX_RETRIES ? 'Still loading...' : 'Retry if taking too long'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error UI
  if (error && !analyticsData) {
    return (
      <div className="analytics-page">
        <header className="analytics-header">
          <div className="container">
            <div className="header-content">
              <div className="back-section"><Link to="/dashboard" className="back-btn"><FaArrowLeft /> Back to Dashboard</Link></div>
              <div className="title-section"><h1><FaChartBar /> Analytics</h1></div>
            </div>
          </div>
        </header>
        <main className="analytics-main">
          <div className="container">
            <div className="error-banner">
              <div className="error-icon"><FaExclamationTriangle /></div>
              <div className="error-content">
                <h3>Failed to Load Analytics</h3>
                <p>{error}</p>
                <div className="error-actions">
                  <button onClick={handleRetry} className="retry-btn"><FaSync /> Try Again</button>
                  <Link to="/dashboard" className="back-btn">Return to Dashboard</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If we have some data but the page is currently refreshing
  const isUpdating = loading && !!analyticsData;

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div className="container">
          <div className="header-content">
            <div className="back-section"><Link to="/dashboard" className="back-btn"><FaArrowLeft /> Back to Dashboard</Link></div>
            <div className="title-section">
              <h1><FaChartBar /> Analytics {isUpdating && <span className="updating-badge">Updating...</span>}</h1>
              <p>{selectedUrl ? `Analytics for: ${selectedUrl.destinationUrl?.slice(0, 60) ?? selectedUrl.shortId}` : 'Overall Analytics Dashboard'}</p>
              <p className="time-range-display"><FaCalendarAlt /> {getDisplayTimeRange()}</p>
            </div>
            <div className="action-section">
              <button onClick={handleExport} className="export-btn" disabled={isUpdating}><FaDownload /> Export Data</button>
            </div>
          </div>
        </div>
      </header>

      <main className="analytics-main">
        <div className="container">
          {error && analyticsData && (
            <div className="warning-banner">
              <p>{error}</p>
              <button onClick={handleRetry} className="retry-btn small">Retry</button>
            </div>
          )}

          <div className="controls-section">
            <div className="url-selector">
              <label><FaFilter /> Select URL:</label>
              <select value={urlId || 'overall'} onChange={(e) => {
                if (e.target.value === 'overall') {
                  window.location.href = '/analytics';
                } else {
                  window.location.href = `/analytics?url=${e.target.value}`;
                }
              }} disabled={isUpdating}>
                <option value="overall">Overall Analytics</option>
                {userUrls.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.destinationUrl ? u.destinationUrl.slice(0, 50) + '...' : (u.shortId || 'Unknown')}
                  </option>
                ))}
              </select>
            </div>

            <div className="time-range-selector">
              <label><FaCalendar /> Time Range:</label>
              <select value={timeRange} onChange={(e) => handleTimeRangeChange(e.target.value)} disabled={isUpdating}>
                {timeRangeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                <button onClick={handleCustomDateApply} className="apply-date-btn" disabled={isUpdating}>
                  Apply Dates
                </button>
              </div>
            </div>
          )}

          <section className="stats-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><FaMousePointer /></div>
                <div className="stat-info">
                  <h3>{analyticsData?.totalClicks ?? 0}</h3>
                  <p>Total Clicks</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FaUsers /></div>
                <div className="stat-info">
                  <h3>{analyticsData?.uniqueClicks ?? 0}</h3>
                  <p>Unique Visitors</p>
                </div>
              </div>

              {/* Hidden but still present in DOM: Returning Visitors */}
              <div className="stat-card hidden-stat">
                <div className="stat-icon"><FaUserClock /></div>
                <div className="stat-info">
                  <h3>{analyticsData?.returningVisitors ?? 0}</h3>
                  <p>Returning Visitors</p>
                </div>
              </div>

              {/* Hidden but still present in DOM: Conversion Rate */}
              <div className="stat-card hidden-stat">
                <div className="stat-icon"><FaChartBar /></div>
                <div className="stat-info">
                  <h3>{analyticsData?.detailedMetrics?.conversionRate || detailedMetrics.conversionRate || '0%'}</h3>
                  <p>Conversion Rate</p>
                </div>
              </div>
            </div>
          </section>

          <section className="charts-section">
            <div className="charts-grid">
              {/* reordered so Clicks Over Time comes after Device Distribution */}
              <div className="chart-card">
                <AnalyticsChart 
                  data={analyticsData?.topCountries?.rawData || analyticsData?.topCountries || { countries: [], visits: [] }} 
                  type="countries" 
                  title="Top Countries" 
                  timeRange={getDisplayTimeRange()}
                />
              </div>

              <div className="chart-card">
                <AnalyticsChart 
                  data={analyticsData?.deviceDistribution || { devices: [0, 0, 0] }} 
                  type="devices" 
                  title="Device Distribution" 
                  timeRange={getDisplayTimeRange()}
                />
              </div>

              <div className="chart-card">
                <AnalyticsChart 
                  data={analyticsData?.clicksOverTime || { labels: [], values: [] }} 
                  type="clicks" 
                  title="Clicks Over Time" 
                  timeRange={getDisplayTimeRange()}
                />
              </div>

              <div className="chart-card">
                <AnalyticsChart 
                  data={analyticsData?.engagement || { bounced: 0, engaged: 0 }} 
                  type="bounce" 
                  title="Engagement Rate" 
                  timeRange={getDisplayTimeRange()}
                />
              </div>
            </div>
          </section>

          <section className="detailed-metrics">
            <h2 className="section-title"><FaChartBar /> Detailed Metrics</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon"><FaClock /></div>
                <h3>Avg. Time to Click</h3>
                <p className="metric-value">{analyticsData?.detailedMetrics?.avgTimeToClick || detailedMetrics.avgTimeToClick || 'N/A'}</p>
                <p className="metric-label">Average time from view to click</p>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><FaScroll /></div>
                <h3>Avg. Scroll Depth</h3>
                <p className="metric-value">{analyticsData?.detailedMetrics?.avgScrollDepth || detailedMetrics.avgScrollDepth || 'N/A'}</p>
                <p className="metric-label">Average scroll depth percentage</p>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><FaHourglassHalf /></div>
                <h3>Session Duration</h3>
                <p className="metric-value">{analyticsData?.detailedMetrics?.avgSessionDuration || detailedMetrics.avgSessionDuration || 'N/A'}</p>
                <p className="metric-label">Average session duration</p>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><FaExternalLinkAlt /></div>
                <h3>Top Referrer</h3>
                <p className="metric-value">{analyticsData?.detailedMetrics?.topReferrer || detailedMetrics.topReferrer || 'Direct'}</p>
                <p className="metric-label">Top traffic source</p>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><FaGlobe /></div>
                <h3>Peak Hour</h3>
                <p className="metric-value">{analyticsData?.detailedMetrics?.peakHour || detailedMetrics.peakHour || 'N/A'}</p>
                <p className="metric-label">Hour with most clicks</p>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><FaChartBar /></div>
                <h3>Pages/Session</h3>
                <p className="metric-value">{analyticsData?.detailedMetrics?.pagesPerSession || detailedMetrics.pagesPerSession || 'N/A'}</p>
                <p className="metric-label">Average pages per session</p>
              </div>
            </div>
          </section>

          {analyticsData?.topCountries?.rawData && analyticsData.topCountries.rawData.length > 0 && (
            <section className="countries-table-section">
              <h2 className="section-title"><FaGlobe /> Country Details</h2>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Visitors</th>
                      <th>Percentage</th>
                      <th>Returning Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topCountries.rawData.map((country, idx) => {
                      const total = analyticsData.totalClicks || 1;
                      const percentage = ((country.visits / total) * 100).toFixed(1);
                      return (
                        <tr key={idx}>
                          <td>
                            <span className="country-flag">
                              {country.country.length === 2 ? country.country : '🌐'}
                            </span>
                            {country.country.length === 2 ? 
                              (() => {
                                const countryNames = {
                                  'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada',
                                  'AU': 'Australia', 'DE': 'Germany', 'FR': 'France', 'JP': 'Japan',
                                  'CN': 'China', 'IN': 'India', 'BR': 'Brazil', 'RU': 'Russia'
                                };
                                return countryNames[country.country] || country.country;
                              })() 
                              : country.country
                            }
                          </td>
                          <td>{country.visits}</td>
                          <td>{percentage}%</td>
                          <td>{Math.round(country.visits * (analyticsData.returningVisitors / analyticsData.totalClicks || 0.2))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="data-table-section">
            <h2 className="section-title"><FaHistory /> Recent Clicks</h2>
            {Array.isArray(analyticsData?.recentClicks) && analyticsData.recentClicks.length > 0 ? (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>IP Address</th>
                      <th>Country</th>
                      <th>Device</th>
                      <th>Browser</th>
                      <th>Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recentClicks.slice(0, 10).map((c, idx) => (
                      <tr key={idx}>
                        <td>{c.timestamp ? new Date(c.timestamp).toLocaleString() : 'N/A'}</td>
                        <td>{c.ipAddress ? `${c.ipAddress.substring(0, 8)}...` : 'N/A'}</td>
                        <td>
                          <span className="country-flag">
                            {c.country && c.country.length === 2 ? c.country : '🌐'}
                          </span>
                          {c.country || 'Unknown'}
                        </td>
                        <td>
                          {c.device === 'desktop' ? <FaDesktop /> : 
                           c.device === 'mobile' ? <FaMobile /> : 
                           c.device === 'tablet' ? <FaTablet /> : '📱'}
                          {c.device || 'Unknown'}
                        </td>
                        <td>{c.browser || 'Unknown'}</td>
                        <td>{c.referrer ? c.referrer.substring(0, 30) + (c.referrer.length > 30 ? '...' : '') : 'Direct'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No click data available for the selected period</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
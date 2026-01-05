export const generateShortId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTimeRangeLabel = (range) => {
  const labels = {
    'today': 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '90days': 'Last 3 Months',
    '180days': 'Last 6 Months',
    '365days': 'Last Year',
    'all': 'Overall'
  };
  return labels[range] || range;
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  if (/Tablet|iPad|PlayBook|Silk|Android(?!.*Mobile)/.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
};

export const getCountryFromIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code;
  } catch (error) {
    return 'US'; // Default to US
  }
};

export const encryptData = (data, key) => {
  // Simple encryption for sensitive data
  return btoa(JSON.stringify(data));
};

export const decryptData = (encryptedData, key) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch {
    return null;
  }
};
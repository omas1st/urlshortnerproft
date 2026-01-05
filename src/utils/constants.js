export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
  VIDEO: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  SPREADSHEET: ['xls', 'xlsx', 'csv', 'ods'],
  PRESENTATION: ['ppt', 'pptx', 'odp'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const STORAGE_LIMITS = {
  FREE: 100 * 1024 * 1024, // 100MB
  PRO: 10 * 1024 * 1024 * 1024, // 10GB
  ENTERPRISE: 100 * 1024 * 1024 * 1024 // 100GB
};

export const LINK_EXPIRATION_OPTIONS = [
  { label: 'Never', value: null },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '24 hours', value: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: 30 * 24 * 60 * 60 * 1000 },
  { label: '90 days', value: 90 * 24 * 60 * 60 * 1000 }
];

export const CLICK_LIMIT_OPTIONS = [
  { label: 'Unlimited', value: null },
  { label: '1 click', value: 1 },
  { label: '10 clicks', value: 10 },
  { label: '100 clicks', value: 100 },
  { label: '1000 clicks', value: 1000 },
  { label: '10000 clicks', value: 10000 }
];

export const QR_CODE_ERROR_LEVELS = [
  { value: 'L', label: 'Low (7%)' },
  { value: 'M', label: 'Medium (15%)' },
  { value: 'Q', label: 'Quartile (25%)' },
  { value: 'H', label: 'High (30%)' }
];

export const ANALYTICS_PERIODS = [
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'All time', value: 'all' }
];

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'RU', name: 'Russia' },
  { code: 'CN', name: 'China' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'EG', name: 'Egypt' }
];

export const DEVICE_TYPES = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'bot', label: 'Bot' }
];

export const BROWSERS = [
  { value: 'Chrome', label: 'Chrome' },
  { value: 'Firefox', label: 'Firefox' },
  { value: 'Safari', label: 'Safari' },
  { value: 'Edge', label: 'Edge' },
  { value: 'Opera', label: 'Opera' },
  { value: 'IE', label: 'Internet Explorer' }
];

export const OPERATING_SYSTEMS = [
  { value: 'Windows', label: 'Windows' },
  { value: 'macOS', label: 'macOS' },
  { value: 'Linux', label: 'Linux' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Android', label: 'Android' }
];

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'EST', label: 'Eastern Time (ET)' },
  { value: 'CST', label: 'Central Time (CT)' },
  { value: 'MST', label: 'Mountain Time (MT)' },
  { value: 'PST', label: 'Pacific Time (PT)' },
  { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
  { value: 'CET', label: 'Central European Time (CET)' },
  { value: 'IST', label: 'Indian Standard Time (IST)' },
  { value: 'JST', label: 'Japan Standard Time (JST)' },
  { value: 'AEST', label: 'Australian Eastern Time (AET)' }
];

export const SHORT_DOMAIN = 'm.yr';

export const DEFAULT_SETTINGS = {
  link: {
    expiration: null,
    password: '',
    maxClicks: null,
    enableTracking: true,
    enablePreview: false,
    enablePassword: false
  },
  file: {
    expiration: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxDownloads: null,
    enablePassword: false,
    oneTimeDownload: false
  },
  qr: {
    size: 256,
    level: 'H',
    margin: 4,
    fgColor: '#000000',
    bgColor: '#FFFFFF'
  }
};

export const THEME_COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

export const SOCIAL_PLATFORMS = [
  { name: 'Facebook', color: '#1877F2', icon: 'facebook' },
  { name: 'Twitter', color: '#1DA1F2', icon: 'twitter' },
  { name: 'Instagram', color: '#E4405F', icon: 'instagram' },
  { name: 'LinkedIn', color: '#0A66C2', icon: 'linkedin' },
  { name: 'WhatsApp', color: '#25D366', icon: 'whatsapp' },
  { name: 'Telegram', color: '#0088CC', icon: 'telegram' },
  { name: 'Reddit', color: '#FF4500', icon: 'reddit' },
  { name: 'Pinterest', color: '#E60023', icon: 'pinterest' }
];
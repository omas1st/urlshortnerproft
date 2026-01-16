// Timezone utilities for country/local timezone support

// List of common timezones by country/region
export const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },

  // North America
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', country: 'US' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', country: 'US' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', country: 'US' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', country: 'US' },
  { value: 'America/Toronto', label: 'Eastern Time - Toronto', country: 'CA' },
  { value: 'America/Vancouver', label: 'Pacific Time - Vancouver', country: 'CA' },
  { value: 'America/Mexico_City', label: 'Central Time - Mexico City', country: 'MX' },

  // Europe
  { value: 'Europe/London', label: 'London', country: 'GB' },
  { value: 'Europe/Paris', label: 'Paris', country: 'FR' },
  { value: 'Europe/Berlin', label: 'Berlin', country: 'DE' },
  { value: 'Europe/Rome', label: 'Rome', country: 'IT' },
  { value: 'Europe/Madrid', label: 'Madrid', country: 'ES' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', country: 'NL' },
  { value: 'Europe/Brussels', label: 'Brussels', country: 'BE' },
  { value: 'Europe/Zurich', label: 'Zurich', country: 'CH' },
  { value: 'Europe/Stockholm', label: 'Stockholm', country: 'SE' },
  { value: 'Europe/Oslo', label: 'Oslo', country: 'NO' },
  { value: 'Europe/Helsinki', label: 'Helsinki', country: 'FI' },
  { value: 'Europe/Warsaw', label: 'Warsaw', country: 'PL' },
  { value: 'Europe/Prague', label: 'Prague', country: 'CZ' },
  { value: 'Europe/Budapest', label: 'Budapest', country: 'HU' },
  { value: 'Europe/Vienna', label: 'Vienna', country: 'AT' },
  { value: 'Europe/Dublin', label: 'Dublin', country: 'IE' },
  { value: 'Europe/Lisbon', label: 'Lisbon', country: 'PT' },
  { value: 'Europe/Athens', label: 'Athens', country: 'GR' },
  { value: 'Europe/Istanbul', label: 'Istanbul', country: 'TR' },
  { value: 'Europe/Moscow', label: 'Moscow', country: 'RU' },

  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo', country: 'JP' },
  { value: 'Asia/Shanghai', label: 'Shanghai', country: 'CN' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', country: 'HK' },
  { value: 'Asia/Singapore', label: 'Singapore', country: 'SG' },
  { value: 'Asia/Seoul', label: 'Seoul', country: 'KR' },
  { value: 'Asia/Bangkok', label: 'Bangkok', country: 'TH' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)', country: 'IN' },
  { value: 'Asia/Dubai', label: 'Dubai', country: 'AE' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem', country: 'IL' },
  { value: 'Asia/Riyadh', label: 'Riyadh', country: 'SA' },
  { value: 'Asia/Karachi', label: 'Karachi', country: 'PK' },
  { value: 'Asia/Dhaka', label: 'Dhaka', country: 'BD' },
  { value: 'Asia/Jakarta', label: 'Jakarta', country: 'ID' },
  { value: 'Asia/Manila', label: 'Manila', country: 'PH' },
  { value: 'Asia/Taipei', label: 'Taipei', country: 'TW' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City', country: 'VN' },

  // Australia / Pacific
  { value: 'Australia/Sydney', label: 'Sydney', country: 'AU' },
  { value: 'Australia/Melbourne', label: 'Melbourne', country: 'AU' },
  { value: 'Australia/Brisbane', label: 'Brisbane', country: 'AU' },
  { value: 'Australia/Perth', label: 'Perth', country: 'AU' },
  { value: 'Pacific/Auckland', label: 'Auckland', country: 'NZ' },
  { value: 'Pacific/Honolulu', label: 'Honolulu', country: 'US' },

  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo', country: 'BR' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', country: 'AR' },
  { value: 'America/Lima', label: 'Lima', country: 'PE' },
  { value: 'America/Bogota', label: 'Bogota', country: 'CO' },
  { value: 'America/Santiago', label: 'Santiago', country: 'CL' },
  { value: 'America/Caracas', label: 'Caracas', country: 'VE' },

  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', country: 'EG' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', country: 'ZA' },
  { value: 'Africa/Lagos', label: 'Lagos', country: 'NG' },
  { value: 'Africa/Nairobi', label: 'Nairobi', country: 'KE' },
  { value: 'Africa/Casablanca', label: 'Casablanca', country: 'MA' },
  { value: 'Africa/Tunis', label: 'Tunis', country: 'TN' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa', country: 'ET' }
];

// Get timezone by country code or name
export const getTimezonesByCountry = (countryCode) => {
  if (!countryCode) return timezones;
  const lower = countryCode.toLowerCase();
  return timezones.filter(
    (tz) =>
      tz.country?.toLowerCase() === lower ||
      tz.label.toLowerCase().includes(lower)
  );
};

// Search timezones by query (country or city)
export const searchTimezones = (query) => {
  if (!query) return timezones;
  const lowerQuery = query.toLowerCase();
  return timezones.filter(
    (tz) =>
      tz.label.toLowerCase().includes(lowerQuery) ||
      tz.value.toLowerCase().includes(lowerQuery) ||
      tz.country?.toLowerCase().includes(lowerQuery)
  );
};

// Get current time in specific timezone
export const getCurrentTimeInTimezone = (timezone = 'UTC') => {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
  } catch {
    return '00:00:00';
  }
};

// Convert UTC hour to timezone hour
export const convertUTCToTimezone = (utcHour, timezone = 'UTC') => {
  try {
    const date = new Date();
    date.setUTCHours(utcHour, 0, 0, 0);

    const timezoneHour = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    }).format(date);

    return parseInt(timezoneHour, 10);
  } catch {
    return utcHour;
  }
};

// Convert timezone hour to UTC hour
export const convertTimezoneToUTC = (timezoneHour) => {
  try {
    const date = new Date();
    date.setHours(timezoneHour, 0, 0, 0);

    const utcHour = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      hour: 'numeric',
      hour12: false
    }).format(date);

    return parseInt(utcHour, 10);
  } catch {
    return timezoneHour;
  }
};

// Format hour label
export const formatHourLabel = (hour, timezone = 'UTC', use12Hour = false) => {
  if (use12Hour) {
    if (hour === 0) return '12AM';
    if (hour === 12) return '12PM';
    return hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
  }
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Get timezone offset from UTC in hours
export const getTimezoneOffset = (timezone = 'UTC') => {
  try {
    const now = new Date();
    const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return (tzTime - now) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
};

// Get user's local timezone
export const getUserLocalTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// Get timezone display name
export const getTimezoneDisplayName = (timezone = 'UTC') => {
  if (timezone === 'UTC') return 'UTC';

  const tz = timezones.find((t) => t.value === timezone);
  if (tz) return tz.label;

  const parts = timezone.split('/');
  const city = parts.pop()?.replace('_', ' ');
  return city || timezone;
};

// Default export
const timezoneUtils = {
  timezones,
  getTimezonesByCountry,
  searchTimezones,
  getCurrentTimeInTimezone,
  convertUTCToTimezone,
  convertTimezoneToUTC,
  formatHourLabel,
  getTimezoneOffset,
  getUserLocalTimezone,
  getTimezoneDisplayName
};

export default timezoneUtils;

import React from 'react';
import { FaMapMarkerAlt, FaCity, FaGlobe } from 'react-icons/fa';
import './TopCitiesList.css';

const TopCitiesList = ({ data, timeRange }) => {
  // START: Debugging Logs - ADD THIS
  console.log('=== TopCitiesList Props ===');
  console.log('Full `data` prop:', data);
  console.log('Type of `data`: ', typeof data);
  if (data && Array.isArray(data)) {
    console.log('Array length:', data.length);
    if (data.length > 0) console.log('First item:', data[0]);
  } else if (data && typeof data === 'object') {
    console.log('Object keys:', Object.keys(data));
  }
  // END: Debugging Logs

  // Enhanced country name to flag mapping
  const getCountryFlag = (countryName) => {
    if (!countryName || typeof countryName !== 'string') return '🏳️';
    
    const country = countryName.trim();
    
    // Map common country names to ISO country codes for flag emojis
    const countryToCodeMap = {
      'united states': 'US',
      'united states of america': 'US',
      'usa': 'US',
      'us': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'great britain': 'GB',
      'canada': 'CA',
      'germany': 'DE',
      'france': 'FR',
      'australia': 'AU',
      'japan': 'JP',
      'china': 'CN',
      'india': 'IN',
      'brazil': 'BR',
      'mexico': 'MX',
      'spain': 'ES',
      'italy': 'IT',
      'netherlands': 'NL',
      'south korea': 'KR',
      'russia': 'RU',
      'sweden': 'SE',
      'norway': 'NO',
      'denmark': 'DK',
      'finland': 'FI',
      'poland': 'PL',
      'turkey': 'TR',
      'singapore': 'SG',
      'malaysia': 'MY',
      'indonesia': 'ID',
      'philippines': 'PH',
      'vietnam': 'VN',
      'thailand': 'TH',
      'saudi arabia': 'SA',
      'uae': 'AE',
      'united arab emirates': 'AE',
      'south africa': 'ZA',
      'egypt': 'EG',
      'nigeria': 'NG',
      'kenya': 'KE',
      'pakistan': 'PK',
      'bangladesh': 'BD',
      'argentina': 'AR',
      'chile': 'CL',
      'colombia': 'CO',
      'peru': 'PE',
    };
    
    const countryLower = country.toLowerCase();
    const countryCode = countryToCodeMap[countryLower] || 
                      (country.length === 2 ? country.toUpperCase() : null);
    
    if (countryCode && countryCode.length === 2) {
      try {
        // Convert ISO country code to flag emoji
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt(0));
        
        return String.fromCodePoint(...codePoints);
      } catch (error) {
        console.warn('Error generating flag for country:', countryCode, error);
      }
    }
    
    // Fallback for unknown countries
    if (country.length === 2) {
      return '🏴'; // Black flag for 2-letter codes we don't recognize
    }
    return '🏳️'; // White flag for other cases
  };

  // Process city data with better error handling
  const processCityData = () => {
    // Handle if data is already in the processed format from backend
    if (data && !Array.isArray(data) && data.topCities) {
      // If data has topCities property (from overall analytics response)
      data = data.topCities;
    }
    
    if (!data || !Array.isArray(data)) {
      return Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        city: 'No data',
        country: '',
        count: 0,
        percentage: 0
      }));
    }

    // Sort by count descending and take top 10
    const sortedData = data
      .filter(item => {
        const city = item.city || item._id?.city || '';
        return city && city !== 'Unknown' && city !== 'unknown' && city.trim() !== '';
      })
      .sort((a, b) => {
        const countA = a.count || a.clicks || 0;
        const countB = b.count || b.clicks || 0;
        return countB - countA;
      })
      .slice(0, 10)
      .map((item, index) => {
        const city = item.city || item._id?.city || 'Unknown';
        const country = item.country || item._id?.country || '';
        const count = item.count || item.clicks || 0;
        
        return {
          rank: index + 1,
          city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
          country: country.charAt(0).toUpperCase() + country.slice(1).toLowerCase(),
          count: count,
          percentage: 0
        };
      });

    // Calculate percentages
    const total = sortedData.reduce((sum, item) => sum + item.count, 0) || 1;
    const processedData = sortedData.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0'
    }));

    return processedData;
  };

  const cityData = processCityData();
  const totalClicks = cityData.reduce((sum, city) => sum + city.count, 0);
  const uniqueCities = cityData.filter(city => city.count > 0 && city.city !== 'No data').length;
  const topCity = cityData[0]?.city !== 'No data' ? cityData[0] : null;

  return (
    <div className="top-cities-list">
      <div className="list-header">
        <h3>Top Cities by Clicks</h3>
        <span className="time-range">{timeRange}</span>
      </div>
      
      <div className="cities-table">
        <div className="table-header">
          <div className="header-cell rank">Rank</div>
          <div className="header-cell city">City</div>
          <div className="header-cell country">Country</div>
          <div className="header-cell clicks">Clicks</div>
          <div className="header-cell percentage">Share</div>
          <div className="header-cell bar">Distribution</div>
        </div>
        
        <div className="table-body">
          {cityData.map((city) => (
            <div key={`${city.city}-${city.rank}-${city.country}`} className="city-row">
              <div className="cell rank">
                <span className={`rank-badge rank-${city.rank}`}>
                  #{city.rank}
                </span>
              </div>
              
              <div className="cell city">
                <div className="city-info">
                  <FaMapMarkerAlt className="city-icon" />
                  <span className="city-name" title={city.city}>
                    {city.city}
                  </span>
                </div>
              </div>
              
              <div className="cell country">
                <div className="country-info">
                  <span className="country-flag" title={city.country}>
                    {getCountryFlag(city.country)}
                  </span>
                  <span className="country-name">
                    {city.country || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="cell clicks">
                <span className="click-count">{city.count}</span>
              </div>
              
              <div className="cell percentage">
                <span className="percentage-value">{city.percentage}%</span>
              </div>
              
              <div className="cell bar">
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${Math.min(100, parseFloat(city.percentage) || 0)}%`,
                      opacity: city.count > 0 ? 0.7 + (parseFloat(city.percentage) / 100) : 0.3
                    }}
                    title={`${city.percentage}% of total clicks`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="cities-summary">
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <FaCity />
            </div>
            <div className="summary-content">
              <h4>Top City</h4>
              <p className="summary-value" title={topCity?.country ? `${topCity.city}, ${topCity.country}` : topCity?.city}>
                {topCity ? topCity.city : 'No data'}
              </p>
              <p className="summary-label">
                {topCity ? `${topCity.count} clicks` : '0 clicks'}
              </p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <FaGlobe />
            </div>
            <div className="summary-content">
              <h4>Total Cities</h4>
              <p className="summary-value">
                {uniqueCities}
              </p>
              <p className="summary-label">
                with activity
              </p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="summary-content">
              <h4>Total Clicks</h4>
              <p className="summary-value">
                {totalClicks}
              </p>
              <p className="summary-label">
                from all cities
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="cities-note">
        <small>
          * City data is estimated based on IP geolocation. 
          Some clicks may show as "Unknown" due to privacy settings or VPN usage.
        </small>
      </div>
    </div>
  );
};

export default TopCitiesList;
import React from 'react';
import { FaWindows, FaApple, FaAndroid, FaMobileAlt } from 'react-icons/fa';
import './OSTable.css';

const OSTable = ({ data, timeRange }) => {
  // Process OS data
  const processOSData = () => {
    if (!data || !Array.isArray(data)) {
      return [
        { os: 'Windows', count: 0, percentage: 0, icon: <FaWindows />, color: '#0078D7' },
        { os: 'macOS', count: 0, percentage: 0, icon: <FaApple />, color: '#000000' },
        { os: 'Android', count: 0, percentage: 0, icon: <FaAndroid />, color: '#3DDC84' },
        { os: 'iOS', count: 0, percentage: 0, icon: <FaMobileAlt />, color: '#000000' }
      ];
    }

    // Initialize OS counters
    const osCounts = {
      'Windows': 0,
      'macOS': 0,
      'Android': 0,
      'iOS': 0
    };

    // Count OS from data
    data.forEach(item => {
      const os = item._id || item.os || '';
      const count = item.count || item.clicks || 0;
      
      const osLower = os.toLowerCase();
      if (osLower.includes('win') || osLower.includes('windows')) {
        osCounts['Windows'] += count;
      } else if (osLower.includes('mac') || osLower.includes('os x') || osLower.includes('darwin')) {
        osCounts['macOS'] += count;
      } else if (osLower.includes('android')) {
        osCounts['Android'] += count;
      } else if (osLower.includes('ios') || osLower.includes('iphone') || osLower.includes('ipad')) {
        osCounts['iOS'] += count;
      }
    });

    // Calculate total and percentages
    const total = Object.values(osCounts).reduce((sum, val) => sum + val, 0) || 1;

    return Object.entries(osCounts).map(([os, count]) => ({
      os,
      count,
      percentage: ((count / total) * 100).toFixed(1),
      icon: os === 'Windows' ? <FaWindows /> : 
            os === 'macOS' ? <FaApple /> : 
            os === 'Android' ? <FaAndroid /> : <FaMobileAlt />,
      color: os === 'Windows' ? '#0078D7' : 
             os === 'macOS' ? '#000000' : 
             os === 'Android' ? '#3DDC84' : '#000000'
    }));
  };

  const osData = processOSData();
  const totalUsers = osData.reduce((sum, item) => sum + item.count, 0);

  // Create pictogram representation
  const renderPictogram = (count, percentage) => {
    const maxIcons = 10;
    const iconCount = Math.min(Math.round((count / totalUsers) * maxIcons), maxIcons);
    
    return (
      <div className="pictogram">
        {Array.from({ length: iconCount }).map((_, i) => (
          <div key={i} className="pictogram-icon">👤</div>
        ))}
        {iconCount === 0 && <span className="no-data">No data</span>}
      </div>
    );
  };

  return (
    <div className="os-table">
      <div className="table-header">
        <h3>Operating System Distribution</h3>
        <span className="time-range">{timeRange}</span>
      </div>
      
      <div className="os-grid">
        {osData.map((item) => (
          <div key={item.os} className="os-card">
            <div className="os-header">
              <div className="os-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
              <div className="os-info">
                <h4>{item.os}</h4>
                <div className="os-stats">
                  <span className="os-count">{item.count} users</span>
                  <span className="os-percentage">{item.percentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="os-visualization">
              {renderPictogram(item.count, item.percentage)}
              
              <div className="os-bar">
                <div 
                  className="os-bar-fill" 
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
            
            <div className="os-details">
              <div className="detail-item">
                <span className="detail-label">Share:</span>
                <span className="detail-value">{item.percentage}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Users:</span>
                <span className="detail-value">{item.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="os-summary">
        <div className="summary-item">
          <span className="summary-label">Total Users:</span>
          <span className="summary-value">{totalUsers}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Dominant OS:</span>
          <span className="summary-value">
            {osData.reduce((max, item) => item.count > max.count ? item : max, osData[0])?.os}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OSTable;
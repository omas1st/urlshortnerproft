import React from 'react';
import './PeakHourChart.css';

const PeakHourChart = ({ data, timeRange }) => {
  // Process peak hour data
  const processPeakHourData = () => {
    if (!data || !Array.isArray(data)) {
      // Return empty data for 24 hours
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        hourLabel: i === 0 ? '12AM' : 
                  i === 12 ? '12PM' : 
                  i < 12 ? `${i}AM` : `${i-12}PM`,
        count: 0,
        percentage: 0
      }));
    }

    // Create hour map - handle both formats
    const hourMap = {};
    data.forEach(item => {
      const hour = item.hour !== undefined ? item.hour : item._id;
      const count = item.count || item.clicks || 0;
      hourMap[hour] = count;
    });

    // Fill all 24 hours
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: i === 0 ? '12AM' : 
                i === 12 ? '12PM' : 
                i < 12 ? `${i}AM` : `${i-12}PM`,
      count: hourMap[i] || 0,
      percentage: 0
    }));

    // Calculate percentages
    const maxCount = Math.max(...hourData.map(h => h.count));
    hourData.forEach(hour => {
      hour.percentage = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
    });

    return hourData;
  };

  const hourData = processPeakHourData();
  const totalClicks = hourData.reduce((sum, hour) => sum + hour.count, 0);
  const peakHour = hourData.reduce((max, hour) => hour.count > max.count ? hour : hourData[0]);

  // Get color intensity based on percentage
  const getBlockColor = (percentage) => {
    if (percentage === 0) return '░░░';
    if (percentage < 25) return '░░░';
    if (percentage < 50) return '▓▓▓';
    if (percentage < 75) return '███';
    return '███';
  };

  // Get number of blocks to display
  const getBlocks = (percentage) => {
    const blockCount = Math.ceil(percentage / 4); // Scale to 25 blocks max
    return getBlockColor(percentage).repeat(blockCount);
  };

  // Format hour range
  const formatHourRange = (hour) => {
    const nextHour = (hour + 1) % 24;
    const format = (h) => {
      if (h === 0) return '12AM';
      if (h === 12) return '12PM';
      return h < 12 ? `${h}AM` : `${h-12}PM`;
    };
    return `${format(hour)} - ${format(nextHour)}`;
  };

  return (
    <div className="peak-hour-chart">
      <div className="chart-header">
        <h3>Daily Traffic Pattern (Average)</h3>
        <span className="time-range">{timeRange}</span>
      </div>
      
      <div className="chart-content">
        <div className="ascii-chart">
          <div className="chart-border">─────────────────────────────────</div>
          
          {hourData.map((hour) => (
            <div key={hour.hour} className="hour-row">
              <span className="hour-label">
                {hour.hourLabel.padStart(3, ' ')}
              </span>
              <span className="hour-bar">
                ┼{getBlocks(hour.percentage)}
              </span>
              <span className="hour-count">
                {hour.count > 0 ? `(${hour.count})` : ''}
              </span>
            </div>
          ))}
          
          <div className="chart-border">─────────────────────────────────</div>
        </div>
        
        <div className="hour-details">
          <div className="peak-hour-info">
            <h4>Peak Hour Analysis</h4>
            <div className="peak-hour-stats">
              <div className="stat-item">
                <span className="stat-label">Peak Hour:</span>
                <span className="stat-value">{formatHourRange(peakHour.hour)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Peak Clicks:</span>
                <span className="stat-value">{peakHour.count}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Daily Clicks:</span>
                <span className="stat-value">{totalClicks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average/Hour:</span>
                <span className="stat-value">{(totalClicks / 24).toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="hour-distribution">
            <h4>Hourly Distribution</h4>
            <div className="distribution-grid">
              {hourData.map((hour) => (
                <div 
                  key={hour.hour} 
                  className={`distribution-item ${hour.count > 0 ? 'active' : ''}`}
                  title={`${formatHourRange(hour.hour)}: ${hour.count} clicks`}
                >
                  <div className="hour-number">{hour.hour}</div>
                  <div className="hour-label-small">
                    {hour.hourLabel.replace('AM', '').replace('PM', '')}
                  </div>
                  <div className="hour-count-small">{hour.count}</div>
                  <div 
                    className="hour-bar-small"
                    style={{ height: `${hour.percentage}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="time-zone-note">
        <small>All times shown in your local timezone. Peak hour represents {formatHourRange(peakHour.hour)} with {peakHour.count} clicks.</small>
      </div>
    </div>
  );
};

export default PeakHourChart;
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
  
  // Find the hour with maximum clicks - fix the reduce logic
  const peakHour = hourData.reduce((max, hour) => {
    return hour.count > max.count ? hour : max;
  }, hourData[0] || { hour: 0, count: 0 });

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

  // Calculate average per hour
  const averagePerHour = totalClicks / 24;

  return (
    <div className="phc-peak-hour-chart">
      <div className="phc-chart-header">
        <h3>Daily Traffic Pattern (Average)</h3>
        <span className="phc-time-range">{timeRange}</span>
      </div>
      
      <div className="phc-chart-content">
        <div className="phc-ascii-chart" aria-hidden="false">
          <div className="phc-chart-border" role="presentation">─────────────────────────────────</div>
          
          {hourData.map((hour) => (
            <div key={hour.hour} className="phc-hour-row">
              <span className="phc-hour-label" aria-hidden="true">
                {hour.hourLabel.padStart(3, ' ')}
              </span>
              <span className="phc-hour-bar" aria-hidden="true">
                ┼{getBlocks(hour.percentage)}
              </span>
              <span className="phc-hour-count" aria-label={`${hour.count} clicks`}>
                {hour.count > 0 ? `(${hour.count})` : ''}
              </span>
            </div>
          ))}
          
          <div className="phc-chart-border" role="presentation">─────────────────────────────────</div>
        </div>
        
        <div className="phc-hour-details">
          <div className="phc-peak-hour-info">
            <h4>Peak Hour Analysis</h4>
            <div className="phc-peak-hour-stats">
              <div className="phc-stat-item">
                <span className="phc-stat-label">Peak Hour:</span>
                <span className="phc-stat-value">{formatHourRange(peakHour.hour)}</span>
                <span className="phc-stat-note">(Highest traffic: {peakHour.count} clicks)</span>
              </div>
              <div className="phc-stat-item">
                <span className="phc-stat-label">Peak Hour Clicks:</span>
                <span className="phc-stat-value">{peakHour.count}</span>
                <span className="phc-stat-note">
                  {totalClicks > 0 ? `(${((peakHour.count / totalClicks) * 100).toFixed(1)}% of daily total)` : ''}
                </span>
              </div>
              <div className="phc-stat-item">
                <span className="phc-stat-label">Total Daily Clicks:</span>
                <span className="phc-stat-value">{totalClicks}</span>
              </div>
              <div className="phc-stat-item">
                <span className="phc-stat-label">Average/Hour:</span>
                <span className="phc-stat-value">{averagePerHour.toFixed(1)}</span>
                <span className="phc-stat-note">
                  (Peak is {averagePerHour > 0 ? (peakHour.count / averagePerHour).toFixed(1) : 'N/A'}× average)
                </span>
              </div>
            </div>
            
            {/* Peak hour insights */}
            {peakHour.count > 0 && (
              <div className="phc-peak-insights">
                <h5>Insights:</h5>
                <ul>
                  <li>Peak activity occurs at {formatHourRange(peakHour.hour)}</li>
                  <li>This hour accounts for {((peakHour.count / totalClicks) * 100).toFixed(1)}% of daily traffic</li>
                  <li>
                    {peakHour.count > averagePerHour ? 
                      `Peak hour traffic is ${(peakHour.count / averagePerHour).toFixed(1)} times higher than average` :
                      'Traffic is relatively evenly distributed'}
                  </li>
                  {peakHour.hour >= 9 && peakHour.hour <= 17 && (
                    <li>Peak aligns with standard business hours</li>
                  )}
                  {peakHour.hour >= 18 && peakHour.hour <= 23 && (
                    <li>Peak aligns with evening/night hours</li>
                  )}
                  {peakHour.hour >= 0 && peakHour.hour <= 8 && (
                    <li>Peak aligns with early morning hours</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="phc-hour-distribution">
            <h4>Hourly Distribution</h4>
            <div className="phc-distribution-grid">
              {hourData.map((hour) => (
                <div 
                  key={hour.hour} 
                  className={`phc-distribution-item ${hour.count > 0 ? 'phc-active' : ''} ${hour.hour === peakHour.hour ? 'phc-peak-hour' : ''}`}
                  title={`${formatHourRange(hour.hour)}: ${hour.count} clicks (${hour.percentage.toFixed(1)}% of peak)`}
                >
                  <div className="phc-hour-number">{hour.hour}</div>
                  <div className="phc-hour-label-small">
                    {hour.hourLabel.replace('AM', '').replace('PM', '')}
                  </div>
                  <div className="phc-hour-count-small">{hour.count}</div>
                  <div 
                    className="phc-hour-bar-small"
                    style={{ height: `${hour.percentage}%` }}
                  />
                  {hour.hour === peakHour.hour && (
                    <div className="phc-peak-indicator" title="Peak Hour">↑</div>
                  )}
                </div>
              ))}
            </div>
            <div className="phc-distribution-legend">
              <div className="phc-legend-item">
                <div className="phc-legend-color phc-peak-indicator"></div>
                <span>Peak Hour</span>
              </div>
              <div className="phc-legend-item">
                <div className="phc-legend-color phc-active"></div>
                <span>Active Hours</span>
              </div>
              <div className="phc-legend-item">
                <div className="phc-legend-color"></div>
                <span>Low/No Activity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="phc-time-zone-note">
        <small>
          All times shown in your local timezone. 
          Peak hour represents {formatHourRange(peakHour.hour)} with {peakHour.count} clicks.
          {totalClicks === 0 && ' No traffic data available for the selected period.'}
        </small>
      </div>
    </div>
  );
};

export default PeakHourChart;

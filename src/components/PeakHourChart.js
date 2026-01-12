import React, { useState, useEffect } from 'react';
import './PeakHourChart.css';
import { 
  timezones, 
  searchTimezones, 
  convertUTCToTimezone, 
  formatHourLabel,
  getTimezoneDisplayName 
} from '../utils/timezones';

const PeakHourChart = ({ data, timeRange, initialTimezone = 'UTC' }) => {
  const [selectedTimezone, setSelectedTimezone] = useState(initialTimezone);
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState(timezones);

  // Filter timezones when search changes
  useEffect(() => {
    if (timezoneSearch.trim() === '') {
      setFilteredTimezones(timezones);
    } else {
      const filtered = searchTimezones(timezoneSearch);
      setFilteredTimezones(filtered);
    }
  }, [timezoneSearch]);

  // Process peak hour data with timezone conversion
  const processPeakHourData = () => {
    if (!data || !Array.isArray(data)) {
      // Return empty data for 24 hours
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        hourLabel: formatHourLabel(i, selectedTimezone),
        count: 0,
        percentage: 0,
        utcHour: i // Keep original UTC hour for reference
      }));
    }

    // Create hour map from UTC data
    const utcHourMap = {};
    data.forEach(item => {
      const hour = item.hour !== undefined ? item.hour : item._id;
      const count = item.count || item.clicks || 0;
      utcHourMap[hour] = count;
    });

    // Initialize 24-hour array for target timezone
    const timezoneHourMap = {};
    
    // Convert UTC hours to target timezone hours
    Object.entries(utcHourMap).forEach(([utcHourStr, count]) => {
      const utcHour = parseInt(utcHourStr, 10);
      const timezoneHour = convertUTCToTimezone(utcHour, selectedTimezone);
      
      // Handle wrap-around (24-hour format)
      const adjustedHour = (timezoneHour + 24) % 24;
      
      if (!timezoneHourMap[adjustedHour]) {
        timezoneHourMap[adjustedHour] = 0;
      }
      timezoneHourMap[adjustedHour] += count;
    });

    // Fill all 24 hours in the target timezone
    const hourData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      hourLabel: formatHourLabel(i, selectedTimezone),
      count: timezoneHourMap[i] || 0,
      percentage: 0,
      utcHour: null // We don't track which UTC hours contributed to this timezone hour
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
  
  // Find the hour with maximum clicks
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

  // Format hour range with timezone context
  const formatHourRange = (hour) => {
    const nextHour = (hour + 1) % 24;
    const format = (h) => formatHourLabel(h, selectedTimezone);
    return `${format(hour)} - ${format(nextHour)}`;
  };

  // Calculate average per hour
  const averagePerHour = totalClicks / 24;

  // Handle timezone selection
  const handleTimezoneSelect = (timezone) => {
    setSelectedTimezone(timezone);
    setShowTimezoneSelector(false);
    setTimezoneSearch('');
  };

  // Timezone selector component
  const TimezoneSelector = () => (
    <div className="phc-timezone-selector">
      <div className="phc-timezone-search">
        <input
          type="text"
          placeholder="Search timezones by country or city..."
          value={timezoneSearch}
          onChange={(e) => setTimezoneSearch(e.target.value)}
          className="phc-timezone-search-input"
          autoFocus
        />
      </div>
      <div className="phc-timezone-list">
        {filteredTimezones.length > 0 ? (
          filteredTimezones.map((tz) => (
            <div
              key={tz.value}
              className={`phc-timezone-option ${selectedTimezone === tz.value ? 'phc-timezone-selected' : ''}`}
              onClick={() => handleTimezoneSelect(tz.value)}
            >
              <span className="phc-timezone-label">{tz.label}</span>
              <span className="phc-timezone-value">{tz.value}</span>
            </div>
          ))
        ) : (
          <div className="phc-no-timezones">
            No timezones found for "{timezoneSearch}"
          </div>
        )}
      </div>
      <div className="phc-timezone-selector-footer">
        <button
          className="phc-timezone-cancel"
          onClick={() => {
            setShowTimezoneSelector(false);
            setTimezoneSearch('');
          }}
        >
          Cancel
        </button>
        <button
          className="phc-timezone-reset"
          onClick={() => handleTimezoneSelect('UTC')}
        >
          Reset to UTC
        </button>
      </div>
    </div>
  );

  return (
    <div className="phc-peak-hour-chart">
      <div className="phc-chart-header">
        <div className="phc-header-top">
          <h3>Daily Traffic Pattern (Average)</h3>
          <span className="phc-time-range">{timeRange}</span>
        </div>
        
        <div className="phc-timezone-section">
          <div className="phc-timezone-display">
            <span className="phc-timezone-label-small">Timezone:</span>
            <button 
              className="phc-timezone-toggle"
              onClick={() => setShowTimezoneSelector(!showTimezoneSelector)}
              title="Click to change timezone"
            >
              <span className="phc-timezone-name">
                {getTimezoneDisplayName(selectedTimezone)}
              </span>
              <span className="phc-timezone-arrow">▼</span>
            </button>
            {showTimezoneSelector && (
              <div className="phc-timezone-dropdown">
                <TimezoneSelector />
              </div>
            )}
          </div>
          <div className="phc-timezone-note-small">
            Times shown in {getTimezoneDisplayName(selectedTimezone)}
          </div>
        </div>
      </div>
      
      <div className="phc-chart-content">
        <div className="phc-ascii-chart" aria-hidden="false">
          <div className="phc-chart-border" role="presentation">─────────────────────────────────</div>
          
          {hourData.map((hour) => (
            <div key={hour.hour} className="phc-hour-row">
              <span className="phc-hour-label" aria-hidden="true">
                {hour.hourLabel.padStart(4, ' ')}
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
              <div className="phc-stat-item">
                <span className="phc-stat-label">Display Timezone:</span>
                <span className="phc-stat-value">{getTimezoneDisplayName(selectedTimezone)}</span>
                <button 
                  className="phc-change-timezone-btn"
                  onClick={() => setShowTimezoneSelector(true)}
                >
                  Change
                </button>
              </div>
            </div>
            
            {/* Peak hour insights */}
            {peakHour.count > 0 && (
              <div className="phc-peak-insights">
                <h5>Insights:</h5>
                <ul>
                  <li>Peak activity occurs at {formatHourRange(peakHour.hour)} ({getTimezoneDisplayName(selectedTimezone)})</li>
                  <li>This hour accounts for {((peakHour.count / totalClicks) * 100).toFixed(1)}% of daily traffic</li>
                  <li>
                    {peakHour.count > averagePerHour ? 
                      `Peak hour traffic is ${(peakHour.count / averagePerHour).toFixed(1)} times higher than average` :
                      'Traffic is relatively evenly distributed'}
                  </li>
                  {peakHour.hour >= 9 && peakHour.hour <= 17 && (
                    <li>Peak aligns with standard business hours in this timezone</li>
                  )}
                  {peakHour.hour >= 18 && peakHour.hour <= 23 && (
                    <li>Peak aligns with evening/night hours in this timezone</li>
                  )}
                  {peakHour.hour >= 0 && peakHour.hour <= 8 && (
                    <li>Peak aligns with early morning hours in this timezone</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="phc-hour-distribution">
            <h4>Hourly Distribution ({getTimezoneDisplayName(selectedTimezone)})</h4>
            <div className="phc-distribution-grid">
              {hourData.map((hour) => (
                <div 
                  key={hour.hour} 
                  className={`phc-distribution-item ${hour.count > 0 ? 'phc-active' : ''} ${hour.hour === peakHour.hour ? 'phc-peak-hour' : ''}`}
                  title={`${formatHourRange(hour.hour)}: ${hour.count} clicks (${hour.percentage.toFixed(1)}% of peak)`}
                >
                  <div className="phc-hour-number">{hour.hour.toString().padStart(2, '0')}</div>
                  <div className="phc-hour-label-small">
                    {formatHourLabel(hour.hour, selectedTimezone, true).replace('AM', '').replace('PM', '')}
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
          Times displayed in {getTimezoneDisplayName(selectedTimezone)}. 
          Data is converted from UTC to show local peak hours.
          {selectedTimezone !== 'UTC' && ' Click "Change" above to switch to a different timezone.'}
          {totalClicks === 0 && ' No traffic data available for the selected period.'}
        </small>
      </div>
    </div>
  );
};

export default PeakHourChart;
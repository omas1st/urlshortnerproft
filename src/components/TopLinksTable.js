import React from 'react';
import { FaLink, FaArrowUp, FaArrowDown, FaExternalLinkAlt } from 'react-icons/fa';
import './TopLinksTable.css';

const TopLinksTable = ({ data, timeRange, isOverall, selectedUrlId }) => {
  // Process top links data
  const processTopLinksData = () => {
    if (!data || !Array.isArray(data)) {
      return Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        alias: 'No data',
        shortId: '',
        clicks: 0,
        previousClicks: 0,
        change: 0,
        changePercent: 0
      }));
    }

    // Sort by clicks descending and take top 10
    const sortedData = data
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map((item, index) => {
        const currentClicks = item.clicks || 0;
        const previousClicks = item.previousClicks || 0;
        const change = currentClicks - previousClicks;
        const changePercent = previousClicks > 0 ? 
          ((change / previousClicks) * 100).toFixed(1) : 
          currentClicks > 0 ? 100 : 0;

        return {
          rank: index + 1,
          alias: item.alias || item.customName || item.shortId || 'Untitled',
          shortId: item.shortId || item._id || '',
          clicks: currentClicks,
          previousClicks: previousClicks,
          change: change,
          changePercent: parseFloat(changePercent),
          destination: item.destinationUrl || ''
        };
      });

    return sortedData;
  };

  const topLinksData = processTopLinksData();

  // Generate sparkline bars
  const generateSparkline = (clicks, maxClicks) => {
    const barCount = 10;
    const normalized = maxClicks > 0 ? (clicks / maxClicks) * barCount : 0;
    const bars = Math.ceil(normalized);
    
    return (
      <div className="sparkline">
        {Array.from({ length: barCount }).map((_, i) => (
          <div 
            key={i}
            className={`sparkline-bar ${i < bars ? 'filled' : ''}`}
            style={{ 
              height: `${Math.max(20, (i + 1) * 5)}%`,
              opacity: i < bars ? 0.7 - (i * 0.05) : 0.1
            }}
          />
        ))}
      </div>
    );
  };

  // Truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const maxClicks = Math.max(...topLinksData.map(item => item.clicks), 1);

  return (
    <div className="top-links-table">
      <div className="table-container">
        <table className="links-table">
          <thead>
            <tr>
              <th className="rank-col">Rank</th>
              <th className="alias-col">Link Alias</th>
              <th className="clicks-col">Clicks</th>
              <th className="sparkline-col">Trend</th>
              <th className="change-col">% Change</th>
              <th className="period-col">Period</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topLinksData.map((link) => (
              <tr key={link.shortId} className={`link-row ${link.clicks === 0 ? 'no-data' : ''}`}>
                <td className="rank-cell">
                  <div className={`rank-number rank-${link.rank}`}>
                    {link.rank}
                  </div>
                </td>
                
                <td className="alias-cell">
                  <div className="alias-content">
                    <FaLink className="link-icon" />
                    <div className="alias-text">
                      <div className="alias-main">
                        {truncateText(link.alias, 30)}
                      </div>
                      {link.destination && (
                        <div className="alias-destination">
                          {truncateText(link.destination, 40)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="clicks-cell">
                  <div className="clicks-content">
                    <span className="clicks-current">{link.clicks}</span>
                    {link.previousClicks > 0 && (
                      <span className="clicks-previous">
                        prev: {link.previousClicks}
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="sparkline-cell">
                  {generateSparkline(link.clicks, maxClicks)}
                </td>
                
                <td className="change-cell">
                  <div className={`change-indicator ${link.changePercent > 0 ? 'positive' : link.changePercent < 0 ? 'negative' : 'neutral'}`}>
                    {link.changePercent > 0 ? (
                      <>
                        <FaArrowUp /> +{Math.abs(link.changePercent)}%
                      </>
                    ) : link.changePercent < 0 ? (
                      <>
                        <FaArrowDown /> -{Math.abs(link.changePercent)}%
                      </>
                    ) : (
                      '0%'
                    )}
                    <div className="change-absolute">
                      {link.change > 0 ? '+' : ''}{link.change}
                    </div>
                  </div>
                </td>
                
                <td className="period-cell">
                  <span className="period-label">{timeRange}</span>
                </td>
                
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      title="View Analytics"
                      onClick={() => window.location.href = `/analytics?url=${link.shortId}`}
                    >
                      <FaExternalLinkAlt />
                    </button>
                    
                    <button 
                      className="action-btn copy-btn"
                      title="Copy URL"
                      onClick={() => {
                        const url = `${window.location.origin}/s/${link.shortId}`;
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="table-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Links:</span>
            <span className="stat-value">{topLinksData.length}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Total Clicks:</span>
            <span className="stat-value">
              {topLinksData.reduce((sum, link) => sum + link.clicks, 0)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Avg Clicks/Link:</span>
            <span className="stat-value">
              {topLinksData.length > 0 ? 
                Math.round(topLinksData.reduce((sum, link) => sum + link.clicks, 0) / topLinksData.length) : 
                0}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Growth Links:</span>
            <span className="stat-value">
              {topLinksData.filter(link => link.changePercent > 0).length}
            </span>
          </div>
        </div>
        
        <div className="summary-notes">
          <small>
            {isOverall ? 
              'Showing top 10 performing links across all your URLs.' : 
              'Showing performance for the selected URL.'}
          </small>
          <small>
            * Percentage change compares current period with previous period of same duration.
          </small>
        </div>
      </div>
    </div>
  );
};

export default TopLinksTable;
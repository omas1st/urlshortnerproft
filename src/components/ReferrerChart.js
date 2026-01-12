import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaFacebook, FaGoogle, FaEnvelope, FaLink } from 'react-icons/fa';
import './ReferrerChart.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ReferrerChart = ({ data, timeRange }) => {
  // Process referrer data
  const processReferrerData = () => {
    // If data is already in the categorized format from backend
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Check if this is the backend format (has social, search, etc. properties)
      if (data.social || data.search || data.email || data.direct || data.others) {
        return {
          categories: {
            'Social Media': data.social?.total || 0,
            'Search': data.search?.total || 0,
            'Email': data.email?.total || 0,
            'Direct': data.direct?.total || 0,
            'Others': data.others?.total || 0
          },
          details: {
            social: data.social?.details || {},
            search: data.search?.details || {},
            email: data.email?.details || {},
            direct: data.direct?.details || {},
            others: data.others?.details || {}
          }
        };
      }
    }

    // Handle old array format for backward compatibility
    if (!data || !Array.isArray(data)) {
      return {
        categories: {
          'Social Media': 0,
          'Search': 0,
          'Email': 0,
          'Direct': 0,
          'Others': 0
        },
        details: {
          social: {},
          search: {},
          email: {},
          direct: {},
          others: {}
        }
      };
    }

    // Initialize categories (old array processing logic)
    const categories = {
      'Social Media': 0,
      'Search': 0,
      'Email': 0,
      'Direct': 0,
      'Others': 0
    };

    const details = {
      social: {},
      search: {},
      email: {},
      direct: {},
      others: {}
    };

    // Social media platforms
    const socialPlatforms = ['facebook', 'twitter', 'whatsapp', 'instagram', 'linkedin', 'pinterest', 'tiktok', 'reddit'];
    // Search engines
    const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex'];

    // Process array data (old format)
    data.forEach(item => {
      const source = item._id || item.referrer || '';
      const count = item.count || item.clicks || 0;
      const sourceLower = (source || '').toString().toLowerCase();

      // Categorize
      if (source === 'Direct' || sourceLower === 'direct' || source === '') {
        categories['Direct'] += count;
        details.direct[source || 'Direct'] = count;
      } 
      else if (socialPlatforms.some(platform => sourceLower.includes(platform))) {
        categories['Social Media'] += count;
        details.social[source || 'Social'] = count;
      }
      else if (searchEngines.some(engine => sourceLower.includes(engine))) {
        categories['Search'] += count;
        details.search[source || 'Search'] = count;
      }
      else if (sourceLower.includes('mail') || sourceLower.includes('email')) {
        categories['Email'] += count;
        details.email[source || 'Email'] = count;
      }
      else {
        categories['Others'] += count;
        details.others[source || 'Other'] = count;
      }
    });

    return { categories, details };
  };

  const { categories, details } = processReferrerData();
  const categoryEntries = Object.entries(categories);
  const total = categoryEntries.reduce((sum, [, count]) => sum + count, 0) || 1;

  // Prepare chart data
  const chartData = {
    labels: categoryEntries.map(([category]) => category),
    datasets: [
      {
        data: categoryEntries.map(([, count]) => count),
        backgroundColor: [
          'rgba(59,130,246,0.92)',    // Social Media - Blue
          'rgba(16,185,129,0.92)',    // Search - Green
          'rgba(245,158,11,0.92)',    // Email - Yellow/Orange
          'rgba(139,92,246,0.92)',    // Direct - Purple
          'rgba(107,114,128,0.92)'    // Others - Gray
        ],
        borderColor: [
          'rgba(255,255,255,0.85)',
          'rgba(255,255,255,0.85)',
          'rgba(255,255,255,0.85)',
          'rgba(255,255,255,0.85)',
          'rgba(255,255,255,0.85)'
        ],
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // we use a custom legend for consistent layout
      },
      tooltip: {
        yAlign: 'center',
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '62%'
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Social Media':
        return <FaFacebook aria-hidden="true" />;
      case 'Search':
        return <FaGoogle aria-hidden="true" />;
      case 'Email':
        return <FaEnvelope aria-hidden="true" />;
      case 'Direct':
        return <FaLink aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getCategoryDetails = (category) => {
    // Map frontend category names to backend keys
    const categoryMap = {
      'Social Media': 'social',
      'Search': 'search',
      'Email': 'email',
      'Direct': 'direct',
      'Others': 'others'
    };
    
    const key = categoryMap[category] || category.toLowerCase().replace(' ', '');
    const detailData = details[key] || {};
    
    if (Object.keys(detailData).length === 0) return null;

    return (
      <div className="uc-category-details">
        {Object.entries(detailData).map(([source, count]) => (
          <div key={source} className="uc-detail-item">
            <span className="uc-detail-source" title={source}>{source}</span>
            <span className="uc-detail-count">{count}</span>
          </div>
        ))}
      </div>
    );
  };

  // Custom legend to keep consistent layout (color swatches + labels)
  const legendItems = chartData.labels.map((label, i) => {
    const count = chartData.datasets[0].data[i] || 0;
    const percent = ((count / total) * 100).toFixed(1);
    const color = chartData.datasets[0].backgroundColor[i];
    return { label, count, percent, color };
  });

  // Helper to derive a css-safe classname from category, e.g. "Social Media" -> "SocialMedia"
  const categoryToClass = (category) => category.replace(/\s+/g, '');

  return (
    <div className="uc-referrer-chart" role="region" aria-label="Referrer categories and breakdown">
      <div className="uc-chart-header">
        <div className="uc-chart-title">
          <h3>Referrer Categories</h3>
          <span className="uc-time-range">{timeRange}</span>
        </div>

        <div className="uc-chart-legend" aria-hidden="true">
          {legendItems.map((it) => (
            <div className="uc-legend-item" key={it.label}>
              <span className="uc-legend-swatch" style={{ backgroundColor: it.color }} />
              <span className="uc-legend-label">{it.label}</span>
              <span className="uc-legend-count">{it.count}</span>
              <span className="uc-legend-percent">{it.percent}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="uc-chart-content">
        <div className="uc-chart-container">
          <Doughnut data={chartData} options={options} />
        </div>
        
        <div className="uc-referrer-details" aria-live="polite">
          {categoryEntries.map(([category, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const categoryClass = categoryToClass(category);
            
            return (
              <div key={category} className={`uc-referrer-category ${categoryClass}`}>
                <div className="uc-category-header">
                  <div className="uc-category-icon" aria-hidden="true">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="uc-category-info">
                    <h4>{category}</h4>
                    <div className="uc-category-stats">
                      <span className="uc-category-count">{count}</span>
                      <span className="uc-category-percentage">{percentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="uc-category-breakdown">
                  {getCategoryDetails(category)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="uc-referrer-summary" aria-hidden="true">
        <div className="uc-summary-item">
          <span className="uc-summary-label">Total Referrals</span>
          <span className="uc-summary-value">{total}</span>
        </div>
        <div className="uc-summary-item">
          <span className="uc-summary-label">Top Source</span>
          <span className="uc-summary-value">
            {categoryEntries.reduce((max, item) => item[1] > max[1] ? item : max, categoryEntries[0])[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReferrerChart;

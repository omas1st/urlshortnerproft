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
      const sourceLower = source.toLowerCase();

      // Categorize
      if (source === 'Direct' || source === 'direct' || source === '') {
        categories['Direct'] += count;
        details.direct[source] = count;
      } 
      else if (socialPlatforms.some(platform => sourceLower.includes(platform))) {
        categories['Social Media'] += count;
        details.social[source] = count;
      }
      else if (searchEngines.some(engine => sourceLower.includes(engine))) {
        categories['Search'] += count;
        details.search[source] = count;
      }
      else if (sourceLower.includes('mail') || sourceLower.includes('email')) {
        categories['Email'] += count;
        details.email[source] = count;
      }
      else {
        categories['Others'] += count;
        details.others[source] = count;
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
          'rgba(255, 99, 132, 0.8)',    // Social Media - Red
          'rgba(54, 162, 235, 0.8)',     // Search - Blue
          'rgba(255, 205, 86, 0.8)',     // Email - Yellow
          'rgba(75, 192, 192, 0.8)',     // Direct - Green
          'rgba(153, 102, 255, 0.8)'     // Others - Purple
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
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
    cutout: '60%'
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Social Media':
        return <FaFacebook />;
      case 'Search':
        return <FaGoogle />;
      case 'Email':
        return <FaEnvelope />;
      case 'Direct':
        return <FaLink />;
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
      <div className="category-details">
        {Object.entries(detailData).map(([source, count]) => (
          <div key={source} className="detail-item">
            <span className="detail-source">{source}</span>
            <span className="detail-count">{count}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="referrer-chart">
      <div className="chart-header">
        <h3>Referrer Categories</h3>
        <span className="time-range">{timeRange}</span>
      </div>
      
      <div className="chart-content">
        <div className="chart-container" style={{ width: '50%', height: '300px' }}>
          <Doughnut data={chartData} options={options} />
        </div>
        
        <div className="referrer-details">
          {categoryEntries.map(([category, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <div key={category} className="referrer-category">
                <div className="category-header">
                  <div className="category-icon">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="category-info">
                    <h4>{category}</h4>
                    <div className="category-stats">
                      <span className="category-count">{count}</span>
                      <span className="category-percentage">{percentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="category-breakdown">
                  {getCategoryDetails(category)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="referrer-summary">
        <div className="summary-item">
          <span className="summary-label">Total Referrals:</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Top Source:</span>
          <span className="summary-value">
            {categoryEntries.reduce((max, item) => item[1] > max[1] ? item : max, categoryEntries[0])[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReferrerChart;
// src/components/AnalyticsChart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AnalyticsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({ data = {}, type = 'line', title = '', timeRange = '' }) => {
  // Build chartData in a defensive way to accept various backend shapes
  const getChartData = () => {
    switch (type) {
      case 'clicks': {
        const labels = Array.isArray(data.labels) ? data.labels : [];
        const values = Array.isArray(data.values) ? data.values : [];
        return {
          labels,
          datasets: [
            {
              label: 'Clicks',
              data: values,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        };
      }

      case 'countries': {
        // Enhanced country data handling with proper country names
        let labels = [];
        let values = [];
        
        // Handle different data structures
        if (Array.isArray(data) && data.length > 0) {
          // Structure: [{ country: 'US', visits: 10, clicks: 10 }, ...]
          labels = data.map(item => {
            const countryCode = item.country || item._id || 'Unknown';
            return getCountryName(countryCode);
          });
          values = data.map(item => item.visits || item.clicks || item.count || 0);
        } else if (data.countries && data.visits) {
          // Structure: { countries: ['US', 'UK'], visits: [10, 5] }
          labels = data.countries.map(country => getCountryName(country));
          values = data.visits;
        } else if (data.labels && data.values) {
          // Structure: { labels: ['US', 'UK'], values: [10, 5] }
          labels = data.labels.map(country => getCountryName(country));
          values = data.values;
        }
        
        return {
          labels,
          datasets: [
            {
              label: 'Visitors by Country',
              data: values,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)',
                'rgba(83, 102, 255, 0.7)',
                'rgba(40, 159, 64, 0.7)',
                'rgba(210, 199, 199, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
            }
          ]
        };
      }

      case 'devices': {
        // Accept { devices: [d,m,t] } or { desktop: x, mobile: y, tablet: z }
        let values = [0, 0, 0];
        let labels = ['Desktop', 'Mobile', 'Tablet'];
        
        if (Array.isArray(data.devices)) {
          values = data.devices;
        } else if (data && typeof data === 'object') {
          values = [
            Number(data.desktop || data.D || data[0] || 0),
            Number(data.mobile || data.M || data[1] || 0),
            Number(data.tablet || data.T || data[2] || 0)
          ];
        } else if (Array.isArray(data)) {
          values = data;
        }
        
        return {
          labels,
          datasets: [
            {
              label: 'Device Distribution',
              data: values,
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
            }
          ]
        };
      }

      case 'bounce': {
        // Accept { bounced: x, engaged: y } or { bounced: [x], engaged: [y] } or { bounceRate: 30, totalClicks: 100 }
        let bounced = 0;
        let engaged = 0;
        
        if (data.bounced !== undefined && data.engaged !== undefined) {
          bounced = Number(data.bounced || 0);
          engaged = Number(data.engaged || 0);
        } else if (Array.isArray(data) && data.length >= 2) {
          bounced = Number(data[0] || 0);
          engaged = Number(data[1] || 0);
        } else if (data.bounceRate !== undefined && data.totalClicks !== undefined) {
          const total = Number(data.totalClicks || 0);
          const bounceRate = Number(data.bounceRate || 0) / 100;
          bounced = Math.round(total * bounceRate);
          engaged = total - bounced;
        } else if (data.engagement && data.engagement.bounced !== undefined && data.engagement.engaged !== undefined) {
          bounced = Number(data.engagement.bounced || 0);
          engaged = Number(data.engagement.engaged || 0);
        }
        
        // Ensure non-negative values
        bounced = Math.max(0, bounced);
        engaged = Math.max(0, engaged);
        
        const total = bounced + engaged;
        const bouncePercentage = total > 0 ? ((bounced / total) * 100).toFixed(1) : 0;
        const engagementPercentage = total > 0 ? ((engaged / total) * 100).toFixed(1) : 0;
        
        return {
          labels: [
            `Bounced (${bouncePercentage}%)`,
            `Engaged (${engagementPercentage}%)`
          ],
          datasets: [
            {
              data: [bounced, engaged],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
            }
          ]
        };
      }

      default: {
        // Default line chart fallback
        const labels = Array.isArray(data.labels) ? data.labels : (Array.isArray(data.labels) ? data.labels : []);
        const values = Array.isArray(data.values) ? data.values : (Array.isArray(data.data) ? data.data : []);
        return {
          labels,
          datasets: [
            {
              label: title || 'Data',
              data: values,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        };
      }
    }
  };

  const getCountryName = (countryCode) => {
    const countryNames = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
      'BR': 'Brazil',
      'RU': 'Russia',
      'MX': 'Mexico',
      'IT': 'Italy',
      'ES': 'Spain',
      'KR': 'South Korea',
      'ID': 'Indonesia',
      'TR': 'Turkey',
      'SA': 'Saudi Arabia',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'EG': 'Egypt',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'VE': 'Venezuela',
      'MY': 'Malaysia',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'PH': 'Philippines',
      'SG': 'Singapore',
      'AE': 'United Arab Emirates',
      'IL': 'Israel',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'GR': 'Greece',
      'PT': 'Portugal',
      'IE': 'Ireland',
      'NZ': 'New Zealand',
      'PK': 'Pakistan',
      'BD': 'Bangladesh',
      'LK': 'Sri Lanka'
    };
    
    return countryNames[countryCode] || countryCode || 'Unknown';
  };

  const chartData = getChartData();

  // Decide if there's meaningful data to show
  const isDataEmpty = (() => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return true;
    const dataset = chartData.datasets[0];
    const arr = Array.isArray(dataset.data) ? dataset.data : [];
    const allZeros = arr.length === 0 || arr.every(v => Number(v || 0) === 0);
    const noLabels = !Array.isArray(chartData.labels) || chartData.labels.length === 0;
    
    // For doughnut charts (devices/bounce/countries), labels matter too
    if (type === 'devices' || type === 'bounce' || type === 'countries') {
      return allZeros || noLabels;
    }
    
    return allZeros;
  })();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        padding: {
          top: 10,
          bottom: 30
        },
        font: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          size: 16,
          weight: '600'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 25, 40, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += context.parsed;
            } else if (context.raw !== undefined) {
              label += context.raw;
            }
            return label;
          }
        }
      }
    },
    scales: type === 'clicks' ? {
      x: {
        grid: {
          display: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [2, 2],
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1,
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }
        }
      }
    } : (type === 'countries' ? {
      x: {
        grid: {
          display: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [2, 2],
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }
        }
      }
    } : {})
  };

  const renderChart = () => {
    if (isDataEmpty) {
      return (
        <div className="ac-no-data">
          <div className="ac-no-data-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16l2-2 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="ac-no-data-text">No data to display for the selected period</p>
          <p className="ac-no-data-subtext">Try selecting a different time range or check your data source</p>
        </div>
      );
    }

    switch (type) {
      case 'clicks':
        return <Line data={chartData} options={options} />;
      case 'countries':
        return <Bar data={chartData} options={options} />;
      case 'devices':
      case 'bounce':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div className="analytics-chart-container">
      <div className="ac-header">
        <div className="ac-title-wrapper">
          <h3 className="ac-title">{title}</h3>
          {timeRange && <span className="ac-time-range">{timeRange}</span>}
        </div>
      </div>
      <div className="ac-chart-wrapper">
        <div className="ac-chart-area">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
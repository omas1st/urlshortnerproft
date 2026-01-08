import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaChrome, FaFirefox, FaSafari, FaEdge } from 'react-icons/fa';
import './BrowserChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BrowserChart = ({ data, timeRange, totalClicks }) => {
  // Process browser data
  const processBrowserData = () => {
    if (!data || !Array.isArray(data)) {
      return {
        labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Others'],
        values: [0, 0, 0, 0, 0],
        percentages: [0, 0, 0, 0, 0]
      };
    }

    // Initialize browser counters
    const browsers = {
      'Chrome': 0,
      'Safari': 0,
      'Firefox': 0,
      'Edge': 0,
      'Others': 0
    };

    // Count browsers from data
    data.forEach(item => {
      const browser = item._id || item.browser || '';
      const count = item.count || item.clicks || 0;
      
      if (browser.toLowerCase().includes('chrome')) {
        browsers['Chrome'] += count;
      } else if (browser.toLowerCase().includes('safari')) {
        browsers['Safari'] += count;
      } else if (browser.toLowerCase().includes('firefox')) {
        browsers['Firefox'] += count;
      } else if (browser.toLowerCase().includes('edge') || browser.toLowerCase().includes('edg')) {
        browsers['Edge'] += count;
      } else if (browser) {
        browsers['Others'] += count;
      }
    });

    // Sort by count descending
    const sortedEntries = Object.entries(browsers).sort((a, b) => b[1] - a[1]);
    
    const labels = sortedEntries.map(([browser]) => browser);
    const values = sortedEntries.map(([, count]) => count);
    
    // Calculate percentages
    const total = values.reduce((sum, val) => sum + val, 0) || 1;
    const percentages = values.map(val => ((val / total) * 100).toFixed(1));

    return { labels, values, percentages };
  };

  const { labels, values, percentages } = processBrowserData();

  const chartData = {
    labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
    datasets: [
      {
        label: 'Clicks',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // Chrome - Red
          'rgba(54, 162, 235, 0.8)',   // Safari - Blue
          'rgba(255, 159, 64, 0.8)',   // Firefox - Orange
          'rgba(75, 192, 192, 0.8)',   // Edge - Green
          'rgba(255, 205, 86, 0.8)'    // Others - Yellow
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Browser Usage (n=${totalClicks})`,
        padding: {
          bottom: 20
        },
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            const percentage = ((value / totalClicks) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          stepSize: 1
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  const getBrowserIcon = (browser) => {
    switch(browser) {
      case 'Chrome': return <FaChrome style={{ color: '#DB4437' }} />;
      case 'Safari': return <FaSafari style={{ color: '#000000' }} />;
      case 'Firefox': return <FaFirefox style={{ color: '#FF9500' }} />;
      case 'Edge': return <FaEdge style={{ color: '#0078D7' }} />;
      default: return null;
    }
  };

  return (
    <div className="browser-chart">
      <div className="chart-container" style={{ height: '350px' }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="browser-stats">
        {labels.map((browser, index) => (
          <div key={browser} className="browser-stat">
            <div className="browser-header">
              {getBrowserIcon(browser)}
              <span className="browser-name">{browser}</span>
            </div>
            <div className="browser-numbers">
              <span className="browser-count">{values[index]}</span>
              <span className="browser-percentage">{percentages[index]}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowserChart;
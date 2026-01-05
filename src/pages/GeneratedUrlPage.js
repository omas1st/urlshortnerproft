import React, { useState } from 'react';
import GeneratedUrls from '../components/GeneratedUrls';
import UrlShortener from '../components/UrlShortener';
import { 
  FaArrowLeft, 
  FaLink, 
  FaHistory,
  FaCodeBranch,
  FaQrcode
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './GeneratedUrlPage.css';

const GeneratedUrlPage = () => {
  const [activeTab, setActiveTab] = useState('urls');
  const [showUrlShortener, setShowUrlShortener] = useState(false);

  return (
    <div className="generated-url-page">
      {/* Header (no longer sticky — it's part of normal flow) */}
      <header className="page-header">
        <div className="container header-inner">
          <div className="back-section">
            <Link to="/dashboard" className="back-btn" aria-label="Back to Dashboard">
              <FaArrowLeft aria-hidden="true" /> <span className="back-text">Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="title-section">
            <h1 className="page-title">
              <FaLink className="title-icon" aria-hidden="true" /> Your URLs
            </h1>
            <p className="page-subtitle">Manage all your shortened links in one place</p>
          </div>
          
          <div className="action-section">
            <button 
              onClick={() => setShowUrlShortener(!showUrlShortener)}
              className="new-url-btn"
              aria-pressed={showUrlShortener}
            >
              <FaLink aria-hidden="true" /> <span className="new-url-text">{showUrlShortener ? 'Hide' : 'New'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="container">
          {/* URL Shortener Toggle */}
          {showUrlShortener && (
            <section className="shortener-section">
              <UrlShortener isDashboard={true} />
            </section>
          )}

          {/* Tabs */}
          <div className="tabs-section">
            <div className="tabs-header" role="tablist" aria-label="URL management tabs">
              <button 
                className={`tab-btn ${activeTab === 'urls' ? 'active' : ''}`}
                onClick={() => setActiveTab('urls')}
                role="tab"
                aria-selected={activeTab === 'urls'}
              >
                <FaLink /> <span className="tab-text">All URLs</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
                onClick={() => setActiveTab('qr')}
                role="tab"
                aria-selected={activeTab === 'qr'}
              >
                <FaQrcode /> <span className="tab-text">QR Codes</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
                role="tab"
                aria-selected={activeTab === 'history'}
              >
                <FaHistory /> <span className="tab-text">Version History</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'abtesting' ? 'active' : ''}`}
                onClick={() => setActiveTab('abtesting')}
                role="tab"
                aria-selected={activeTab === 'abtesting'}
              >
                <FaCodeBranch /> <span className="tab-text">A/B Testing</span>
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'urls' && (
                <section className="generated-urls-wrapper" aria-live="polite">
                  {/* Original component preserved — CSS handles responsive/stacked card view */}
                  <GeneratedUrls />
                </section>
              )}
              
              {activeTab === 'qr' && (
                <div className="tab-panel">
                  <h2>QR Codes</h2>
                  <p>All your URLs with QR codes will appear here</p>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="tab-panel">
                  <h2>Version History</h2>
                  <p>Track changes to your URLs over time</p>
                </div>
              )}
              
              {activeTab === 'abtesting' && (
                <div className="tab-panel">
                  <h2>A/B Testing</h2>
                  <p>Compare performance of different URL versions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeneratedUrlPage;

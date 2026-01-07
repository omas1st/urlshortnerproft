import React, { useState, useEffect } from 'react';
import { FaTimes, FaGlobe, FaLink, FaCopy, FaCheck, FaCog, FaExclamationTriangle, FaChevronDown } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';
import './BrandLinkPopup.css';

const BrandLinkPopup = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: Select URL, 2: Add Domain, 3: DNS Setup, 4: Verification
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [domain, setDomain] = useState('');
  const [customDomain, setCustomDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [userDomains, setUserDomains] = useState([]);
  const [copied, setCopied] = useState({});

  // Fetch user's URLs
  useEffect(() => {
    fetchBrandableUrls();
    fetchUserDomains();
  }, []);

  const fetchBrandableUrls = async () => {
    try {
      const response = await api.get('/custom-domains/urls/brandable');
      if (response.data.success) {
        setUrls(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      toast.error('Failed to load URLs');
    }
  };

  const fetchUserDomains = async () => {
    try {
      const response = await api.get('/custom-domains');
      if (response.data.success) {
        setUserDomains(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    }
  };

  const handleUrlSelect = (url) => {
    setSelectedUrl(url);
    setStep(2);
  };

  const handleAddDomain = async () => {
    if (!domain.trim() || !selectedUrl) {
      toast.error('Please enter a domain name');
      return;
    }

    // Basic domain validation
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error('Please enter a valid domain (e.g., yourbrand.com)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/custom-domains/add', {
        domain,
        shortId: selectedUrl.shortId
      });

      if (response.data.success) {
        setCustomDomain(response.data.data.customDomain);
        setStep(3);
        toast.success('Domain added! Configure DNS settings below.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add domain';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomain) return;

    setVerifying(true);
    try {
      const response = await api.post(`/custom-domains/${customDomain.id}/verify`);
      
      if (response.data.success) {
        toast.success('Domain verified successfully!');
        setStep(4);
        fetchUserDomains(); // Refresh domains list
      } else {
        toast.error('Verification failed. Please check your DNS settings.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [key]: true });
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setCopied({ ...copied, [key]: false });
      }, 2000);
    });
  };

  const getBackendOrigin = () => {
    if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
    try {
      const winOrigin = window.location.origin;
      return winOrigin.includes(':3000') ? winOrigin.replace(':3000', ':5000') : winOrigin;
    } catch (e) {
      return 'http://localhost:5000';
    }
  };

  // Step 1: Select URL
  const renderStep1 = () => (
    <div className="brand-link-step">
      <div className="step-header">
        <div className="step-number">1</div>
        <h3>Select a URL to Brand</h3>
      </div>
      <p className="step-description">Choose which short link you want to use with your custom domain.</p>
      
      <div className="urls-list">
        {urls.length === 0 ? (
          <div className="empty-state">
            <FaLink className="empty-icon" />
            <p>No URLs available for branding</p>
            <p className="empty-subtext">Create a short URL first to brand it.</p>
          </div>
        ) : (
          urls.map(url => (
            <div 
              key={url.id} 
              className={`url-item ${selectedUrl?.id === url.id ? 'selected' : ''}`}
              onClick={() => handleUrlSelect(url)}
            >
              <div className="url-item-content">
                <div className="url-short">
                  <FaLink />
                  <span className="short-url">
                    {getBackendOrigin()}/s/{url.shortId}
                  </span>
                </div>
                <div className="url-destination">
                  {url.destinationUrl.substring(0, 50)}
                  {url.destinationUrl.length > 50 ? '...' : ''}
                </div>
                <div className="url-stats">
                  <span className="clicks">{url.clicks} clicks</span>
                  <span className="date">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {url.hasBrandedDomains && (
                <div className="branded-badge">
                  <FaGlobe /> Branded
                </div>
              )}
              <FaChevronDown className="select-arrow" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Step 2: Add Domain
  const renderStep2 = () => (
    <div className="brand-link-step">
      <div className="step-header">
        <div className="step-number">2</div>
        <h3>Add Your Custom Domain</h3>
      </div>
      <p className="step-description">Enter the domain you purchased (without http:// or https://).</p>
      
      <div className="selected-url-preview">
        <div className="preview-label">Selected URL:</div>
        <div className="preview-value">
          {getBackendOrigin()}/s/{selectedUrl?.shortId}
        </div>
      </div>
      
      <div className="domain-input-container">
        <div className="input-group">
          <label htmlFor="domain">Your Domain</label>
          <div className="input-with-icon">
            <FaGlobe className="input-icon" />
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value.toLowerCase())}
              placeholder="yourbrand.com"
              className="domain-input"
            />
          </div>
          <small className="help-text">
            Enter the domain exactly as you purchased it (e.g., yourbrand.com)
          </small>
        </div>
        
        <div className="branded-url-preview">
          <div className="preview-label">Branded URL will be:</div>
          <div className="preview-value branded">
            https://{domain || 'yourbrand.com'}/{selectedUrl?.shortId?.substring(0, 6)}...
          </div>
        </div>
      </div>
      
      {userDomains.length > 0 && (
        <div className="existing-domains">
          <h4>Your Existing Domains</h4>
          <div className="domains-list">
            {userDomains.slice(0, 3).map(d => (
              <div key={d._id} className="domain-tag">
                <FaGlobe /> {d.domain}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: DNS Setup
  const renderStep3 = () => (
    <div className="brand-link-step">
      <div className="step-header">
        <div className="step-number">3</div>
        <h3>Configure DNS Settings</h3>
      </div>
      <p className="step-description">
        Add these DNS records at your domain registrar (GoDaddy, Namecheap, etc.)
      </p>
      
      <div className="dns-instructions">
        <div className="instruction-card">
          <div className="instruction-header">
            <FaCog />
            <h4>TXT Record (Verification)</h4>
          </div>
          <div className="instruction-content">
            <div className="dns-row">
              <span className="dns-label">Type:</span>
              <span className="dns-value">TXT</span>
            </div>
            <div className="dns-row">
              <span className="dns-label">Name/Host:</span>
              <span className="dns-value">_brandlink_verify</span>
            </div>
            <div className="dns-row">
              <span className="dns-label">Value:</span>
              <div className="dns-value-container">
                <code className="dns-value-code">
                  {customDomain?.verificationToken || 'Loading...'}
                </code>
                <button
                  className="copy-btn small"
                  onClick={() => copyToClipboard(customDomain?.verificationToken, 'txt')}
                >
                  {copied.txt ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="dns-row">
              <span className="dns-label">TTL:</span>
              <span className="dns-value">3600</span>
            </div>
          </div>
        </div>
        
        <div className="instruction-card">
          <div className="instruction-header">
            <FaCog />
            <h4>CNAME Record (Routing)</h4>
          </div>
          <div className="instruction-content">
            <div className="dns-row">
              <span className="dns-label">Type:</span>
              <span className="dns-value">CNAME</span>
            </div>
            <div className="dns-row">
              <span className="dns-label">Name/Host:</span>
              <span className="dns-value">@ (or leave empty)</span>
            </div>
            <div className="dns-row">
              <span className="dns-label">Value:</span>
              <div className="dns-value-container">
                <code className="dns-value-code">
                  links.{getBackendOrigin().replace(/^https?:\/\//, '')}
                </code>
                <button
                  className="copy-btn small"
                  onClick={() => copyToClipboard(`links.${getBackendOrigin().replace(/^https?:\/\//, '')}`, 'cname')}
                >
                  {copied.cname ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="dns-row">
              <span className="dns-label">TTL:</span>
              <span className="dns-value">3600</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="note-box">
        <FaExclamationTriangle />
        <div className="note-content">
          <strong>Important:</strong> DNS changes can take up to 48 hours to propagate globally.
          After adding these records, wait a few minutes before verifying.
        </div>
      </div>
    </div>
  );

  // Step 4: Verification Complete
  const renderStep4 = () => (
    <div className="brand-link-step">
      <div className="step-header">
        <div className="step-number">4</div>
        <h3>Domain Verified Successfully!</h3>
      </div>
      
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h3>Your Domain is Ready!</h3>
        <p className="success-message">
          Your custom domain has been verified and is now active.
        </p>
        
        <div className="verified-info">
          <div className="info-card">
            <div className="info-label">Your Branded URL</div>
            <div className="info-value branded-url">
              https://{customDomain?.domain}/{customDomain?.brandedShortId}
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(`https://${customDomain?.domain}/${customDomain?.brandedShortId}`, 'final')}
              >
                {copied.final ? <FaCheck /> : <FaCopy />} Copy
              </button>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-label">Original URL</div>
            <div className="info-value">
              {getBackendOrigin()}/s/{selectedUrl?.shortId}
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-label">Destination</div>
            <div className="info-value">
              {selectedUrl?.destinationUrl?.substring(0, 60)}
              {selectedUrl?.destinationUrl?.length > 60 ? '...' : ''}
            </div>
          </div>
        </div>
        
        <div className="next-steps">
          <h4>Next Steps:</h4>
          <ul>
            <li>Share your branded URL: https://{customDomain?.domain}/{customDomain?.brandedShortId}</li>
            <li>Track clicks in your analytics dashboard</li>
            <li>Add more domains from your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="brand-link-popup-overlay">
      <div className="brand-link-popup">
        <div className="popup-header">
          <h2>
            <FaGlobe /> Brand Your Link with Custom Domain
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="popup-content">
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <div className="step-label">Select URL</div>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <div className="step-label">Add Domain</div>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <div className="step-label">DNS Setup</div>
            </div>
            <div className={`step-line ${step >= 4 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <span>4</span>
              <div className="step-label">Complete</div>
            </div>
          </div>
          
          <div className="step-content">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>
          
          <div className="popup-footer">
            {step > 1 && step < 4 && (
              <button
                className="btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            
            {step === 1 && (
              <button
                className="btn-primary"
                onClick={() => setStep(2)}
                disabled={!selectedUrl}
              >
                Next: Add Domain
              </button>
            )}
            
            {step === 2 && (
              <button
                className="btn-primary"
                onClick={handleAddDomain}
                disabled={!domain || loading}
              >
                {loading ? 'Adding Domain...' : 'Add Domain & Continue'}
              </button>
            )}
            
            {step === 3 && (
              <button
                className="btn-primary"
                onClick={handleVerifyDomain}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Domain'}
              </button>
            )}
            
            {step === 4 && (
              <button
                className="btn-primary"
                onClick={onClose}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLinkPopup;
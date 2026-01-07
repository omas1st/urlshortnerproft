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
      <div className="brand-step-header">
        <div className="brand-step-number">1</div>
        <h3>Select a URL to Brand</h3>
      </div>
      <p className="brand-step-description">Choose which short link you want to use with your custom domain.</p>
      
      <div className="brand-urls-list">
        {urls.length === 0 ? (
          <div className="brand-empty-state">
            <FaLink className="brand-empty-icon" />
            <p>No URLs available for branding</p>
            <p className="brand-empty-subtext">Create a short URL first to brand it.</p>
          </div>
        ) : (
          urls.map(url => (
            <div 
              key={url.id} 
              className={`brand-url-item ${selectedUrl?.id === url.id ? 'selected' : ''}`}
              onClick={() => handleUrlSelect(url)}
            >
              <div className="brand-url-item-content">
                <div className="brand-url-short">
                  <FaLink />
                  <span className="brand-short-url">
                    {getBackendOrigin()}/s/{url.shortId}
                  </span>
                </div>
                <div className="brand-url-destination">
                  {url.destinationUrl.substring(0, 50)}
                  {url.destinationUrl.length > 50 ? '...' : ''}
                </div>
                <div className="brand-url-stats">
                  <span className="brand-clicks">{url.clicks} clicks</span>
                  <span className="brand-date">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {url.hasBrandedDomains && (
                <div className="branded-badge">
                  <FaGlobe /> Branded
                </div>
              )}
              <FaChevronDown className="brand-select-arrow" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Step 2: Add Domain
  const renderStep2 = () => (
    <div className="brand-link-step">
      <div className="brand-step-header">
        <div className="brand-step-number">2</div>
        <h3>Add Your Custom Domain</h3>
      </div>
      <p className="brand-step-description">Enter the domain you purchased (without http:// or https://).</p>
      
      <div className="brand-selected-url-preview">
        <div className="brand-preview-label">Selected URL:</div>
        <div className="brand-preview-value">
          {getBackendOrigin()}/s/{selectedUrl?.shortId}
        </div>
      </div>
      
      <div className="brand-domain-input-container">
        <div className="brand-input-group">
          <label htmlFor="domain">Your Domain</label>
          <div className="brand-input-with-icon">
            <FaGlobe className="brand-input-icon" />
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value.toLowerCase())}
              placeholder="yourbrand.com"
              className="brand-domain-input"
            />
          </div>
          <small className="brand-help-text">
            Enter the domain exactly as you purchased it (e.g., yourbrand.com)
          </small>
        </div>
        
        <div className="brand-branded-url-preview">
          <div className="brand-preview-label">Branded URL will be:</div>
          <div className="brand-preview-value branded">
            https://{domain || 'yourbrand.com'}/{selectedUrl?.shortId?.substring(0, 6)}...
          </div>
        </div>
      </div>
      
      {userDomains.length > 0 && (
        <div className="brand-existing-domains">
          <h4>Your Existing Domains</h4>
          <div className="brand-domains-list">
            {userDomains.slice(0, 3).map(d => (
              <div key={d._id} className="brand-domain-tag">
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
      <div className="brand-step-header">
        <div className="brand-step-number">3</div>
        <h3>Configure DNS Settings</h3>
      </div>
      <p className="brand-step-description">
        Add these DNS records at your domain registrar (GoDaddy, Namecheap, etc.)
      </p>
      
      <div className="brand-dns-instructions">
        <div className="brand-instruction-card">
          <div className="brand-instruction-header">
            <FaCog />
            <h4>TXT Record (Verification)</h4>
          </div>
          <div className="brand-instruction-content">
            <div className="brand-dns-row">
              <span className="brand-dns-label">Type:</span>
              <span className="brand-dns-value">TXT</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Name/Host:</span>
              <span className="brand-dns-value">_brandlink_verify</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Value:</span>
              <div className="brand-dns-value-container">
                <code className="brand-dns-value-code">
                  {customDomain?.verificationToken || 'Loading...'}
                </code>
                <button
                  className="brand-copy-btn brand-small"
                  onClick={() => copyToClipboard(customDomain?.verificationToken, 'txt')}
                >
                  {copied.txt ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">TTL:</span>
              <span className="brand-dns-value">3600</span>
            </div>
          </div>
        </div>
        
        <div className="brand-instruction-card">
          <div className="brand-instruction-header">
            <FaCog />
            <h4>CNAME Record (Routing)</h4>
          </div>
          <div className="brand-instruction-content">
            <div className="brand-dns-row">
              <span className="brand-dns-label">Type:</span>
              <span className="brand-dns-value">CNAME</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Name/Host:</span>
              <span className="brand-dns-value">@ (or leave empty)</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Value:</span>
              <div className="brand-dns-value-container">
                <code className="brand-dns-value-code">
                  links.{getBackendOrigin().replace(/^https?:\/\//, '')}
                </code>
                <button
                  className="brand-copy-btn brand-small"
                  onClick={() => copyToClipboard(`links.${getBackendOrigin().replace(/^https?:\/\//, '')}`, 'cname')}
                >
                  {copied.cname ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">TTL:</span>
              <span className="brand-dns-value">3600</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="brand-note-box">
        <FaExclamationTriangle />
        <div className="brand-note-content">
          <strong>Important:</strong> DNS changes can take up to 48 hours to propagate globally.
          After adding these records, wait a few minutes before verifying.
        </div>
      </div>
    </div>
  );

  // Step 4: Verification Complete
  const renderStep4 = () => (
    <div className="brand-link-step">
      <div className="brand-step-header">
        <div className="brand-step-number">4</div>
        <h3>Domain Verified Successfully!</h3>
      </div>
      
      <div className="brand-success-container">
        <div className="brand-success-icon">✅</div>
        <h3>Your Domain is Ready!</h3>
        <p className="brand-success-message">
          Your custom domain has been verified and is now active.
        </p>
        
        <div className="brand-verified-info">
          <div className="brand-info-card">
            <div className="brand-info-label">Your Branded URL</div>
            <div className="brand-info-value branded-url">
              https://{customDomain?.domain}/{customDomain?.brandedShortId}
              <button
                className="brand-copy-btn"
                onClick={() => copyToClipboard(`https://${customDomain?.domain}/${customDomain?.brandedShortId}`, 'final')}
              >
                {copied.final ? <FaCheck /> : <FaCopy />} Copy
              </button>
            </div>
          </div>
          
          <div className="brand-info-card">
            <div className="brand-info-label">Original URL</div>
            <div className="brand-info-value">
              {getBackendOrigin()}/s/{selectedUrl?.shortId}
            </div>
          </div>
          
          <div className="brand-info-card">
            <div className="brand-info-label">Destination</div>
            <div className="brand-info-value">
              {selectedUrl?.destinationUrl?.substring(0, 60)}
              {selectedUrl?.destinationUrl?.length > 60 ? '...' : ''}
            </div>
          </div>
        </div>
        
        <div className="brand-next-steps">
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
        <div className="brand-popup-header">
          <h2>
            <FaGlobe /> Brand Your Link with Custom Domain
          </h2>
          <button className="brand-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="brand-popup-content">
          <div className="brand-step-indicator">
            <div className={`brand-step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <div className="brand-step-label">Select URL</div>
            </div>
            <div className={`brand-step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`brand-step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <div className="brand-step-label">Add Domain</div>
            </div>
            <div className={`brand-step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`brand-step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <div className="brand-step-label">DNS Setup</div>
            </div>
            <div className={`brand-step-line ${step >= 4 ? 'active' : ''}`}></div>
            <div className={`brand-step ${step >= 4 ? 'active' : ''}`}>
              <span>4</span>
              <div className="brand-step-label">Complete</div>
            </div>
          </div>
          
          <div className="brand-step-content">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>
          
          <div className="brand-popup-footer">
            {step > 1 && step < 4 && (
              <button
                className="brand-btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            
            {step === 1 && (
              <button
                className="brand-btn-primary"
                onClick={() => setStep(2)}
                disabled={!selectedUrl}
              >
                Next: Add Domain
              </button>
            )}
            
            {step === 2 && (
              <button
                className="brand-btn-primary"
                onClick={handleAddDomain}
                disabled={!domain || loading}
              >
                {loading ? 'Adding Domain...' : 'Add Domain & Continue'}
              </button>
            )}
            
            {step === 3 && (
              <button
                className="brand-btn-primary"
                onClick={handleVerifyDomain}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Domain'}
              </button>
            )}
            
            {step === 4 && (
              <button
                className="brand-btn-primary"
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
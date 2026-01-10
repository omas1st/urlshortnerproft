import React, { useState, useEffect } from 'react';
import { FaTimes, FaGlobe, FaLink, FaCopy, FaCheck, FaCog, FaExclamationTriangle, FaChevronDown, FaInfoCircle, FaSync, FaClock } from 'react-icons/fa';
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
  const [verificationResult, setVerificationResult] = useState(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [dnsConfig, setDnsConfig] = useState({
    txtName: '_brandlink_verify',
    txtValue: '',
    cnameValue: ''
  });

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
        setDnsConfig({
          txtName: '_brandlink_verify',
          txtValue: response.data.data.customDomain.verificationToken,
          cnameValue: response.data.data.customDomain.dnsInstructions.cname.value
        });
        setStep(3);
        toast.success('Domain added! Configure DNS settings below.');
        // Refresh user domains list
        fetchUserDomains();
      } else {
        toast.error(response.data.message || 'Failed to add domain');
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
    setVerificationResult(null);
    setShowTroubleshooting(false);
    
    try {
      const response = await api.post(`/custom-domains/${customDomain.id}/verify`);
      
      if (response.data.success) {
        setVerificationResult({
          success: true,
          message: response.data.message,
          data: response.data.data
        });
        toast.success('Domain verified successfully!');
        setStep(4);
        fetchUserDomains(); // Refresh domains list
      } else {
        setVerificationResult({
          success: false,
          message: response.data.message,
          data: response.data.data
        });
        toast.error('Verification failed. Please check your DNS settings.');
      }
    } catch (error) {
      const result = error.response?.data || {
        success: false,
        message: error.message || 'Verification failed'
      };
      
      setVerificationResult({
        success: false,
        message: result.message,
        data: result.data,
        troubleshooting: result.data?.troubleshooting
      });
      
      toast.error(result.message || 'Verification failed');
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

  const getFrontendOrigin = () => {
    if (process.env.REACT_APP_WEBSITE_URL) {
      return process.env.REACT_APP_WEBSITE_URL.replace(/\/$/, '');
    }
    try {
      return window.location.origin;
    } catch (e) {
      return 'http://localhost:3000';
    }
  };

  const getBackendOrigin = () => {
    if (process.env.REACT_APP_BACKEND_URL) {
      return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
    }
    try {
      const winOrigin = window.location.origin;
      return winOrigin.includes(':3000') ? winOrigin.replace(':3000', ':5000') : winOrigin;
    } catch (e) {
      return 'http://localhost:5000';
    }
  };

  // Get short URL without /s/ prefix
  const getShortUrl = (urlObj) => {
    if (!urlObj) return '';
    const frontendOrigin = getFrontendOrigin();
    if (urlObj.customName) return `${frontendOrigin}/${urlObj.customName}`;
    if (urlObj.shortId) return `${frontendOrigin}/${urlObj.shortId}`;
    return '';
  };

  // Test DNS lookup (client-side, limited)
  const testDnsLookup = async () => {
    if (!customDomain || !customDomain.verificationToken) return;
    
    toast.loading('Testing DNS lookup...');
    try {
      // Note: Client-side DNS lookup is limited due to browser security
      // This is a simple test that may not work in all browsers
      const testUrl = `https://dns.google/resolve?name=_brandlink_verify.${customDomain.domain}&type=TXT`;
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.Answer) {
        const txtRecords = data.Answer.map(ans => ans.data.replace(/"/g, ''));
        const found = txtRecords.includes(customDomain.verificationToken);
        
        if (found) {
          toast.dismiss();
          toast.success('DNS record found! You can now verify.');
        } else {
          toast.dismiss();
          toast.error('DNS record found but token mismatch.');
        }
      } else {
        toast.dismiss();
        toast.error('No TXT records found. DNS may not have propagated yet.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('DNS test failed. Check your DNS settings.');
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
                    {getShortUrl(url)}
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
          {getShortUrl(selectedUrl)}
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
        Add these DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
      </p>
      
      <div className="brand-dns-instructions">
        <div className="brand-instruction-card">
          <div className="brand-instruction-header">
            <FaCog />
            <h4>TXT Record (Verification)</h4>
            <button
              className="brand-test-btn"
              onClick={testDnsLookup}
              title="Test DNS lookup"
            >
              <FaSync /> Test
            </button>
          </div>
          <div className="brand-instruction-content">
            <div className="brand-dns-row">
              <span className="brand-dns-label">Type:</span>
              <span className="brand-dns-value">TXT</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Name/Host:</span>
              <span className="brand-dns-value">{dnsConfig.txtName}</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Value:</span>
              <div className="brand-dns-value-container">
                <code className="brand-dns-value-code">
                  {dnsConfig.txtValue || customDomain?.verificationToken || 'Loading...'}
                </code>
                <button
                  className="brand-copy-btn brand-small"
                  onClick={() => copyToClipboard(dnsConfig.txtValue || customDomain?.verificationToken, 'txt')}
                >
                  {copied.txt ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">TTL:</span>
              <span className="brand-dns-value">3600 (1 hour)</span>
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
              <span className="brand-dns-value">@ (root domain)</span>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">Value:</span>
              <div className="brand-dns-value-container">
                <code className="brand-dns-value-code">
                  {dnsConfig.cnameValue || `links.${getBackendOrigin().replace(/^https?:\/\//, '')}`}
                </code>
                <button
                  className="brand-copy-btn brand-small"
                  onClick={() => copyToClipboard(dnsConfig.cnameValue || `links.${getBackendOrigin().replace(/^https?:\/\//, '')}`, 'cname')}
                >
                  {copied.cname ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>
            <div className="brand-dns-row">
              <span className="brand-dns-label">TTL:</span>
              <span className="brand-dns-value">3600 (1 hour)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Status */}
      {verificationResult && (
        <div className={`brand-verification-result ${verificationResult.success ? 'success' : 'error'}`}>
          <div className="brand-verification-header">
            {verificationResult.success ? '✅' : '❌'}
            <h4>{verificationResult.success ? 'Verification Result' : 'Verification Failed'}</h4>
          </div>
          <p>{verificationResult.message}</p>
          
          {verificationResult.data?.error && (
            <div className="brand-error-details">
              <strong>Error:</strong> {verificationResult.data.error}
            </div>
          )}
          
          {verificationResult.troubleshooting && !verificationResult.success && (
            <div className="brand-troubleshooting">
              <button
                className="brand-troubleshooting-toggle"
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              >
                <FaInfoCircle /> {showTroubleshooting ? 'Hide' : 'Show'} Troubleshooting Steps
              </button>
              
              {showTroubleshooting && (
                <div className="brand-troubleshooting-steps">
                  <h5>How to fix this:</h5>
                  <ol>
                    {Object.entries(verificationResult.troubleshooting).map(([key, value]) => (
                      <li key={key}>{value}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="brand-note-box">
        <FaExclamationTriangle />
        <div className="brand-note-content">
          <strong>Important DNS Tips:</strong>
          <ul>
            <li>DNS changes can take 5 minutes to 48 hours to propagate globally</li>
            <li>After adding records, wait at least 5 minutes before verifying</li>
            <li>Use "Test" button to check if DNS record is visible</li>
            <li>If verification fails, wait 10 minutes and try again</li>
            <li>Make sure to remove quotes from TXT record value</li>
          </ul>
        </div>
      </div>
      
      <div className="brand-dns-timing">
        <FaClock />
        <div className="brand-timing-content">
          <strong>Expected Timing:</strong>
          <div className="brand-timing-steps">
            <div className="brand-timing-step">
              <span className="brand-timing-label">Immediately:</span>
              <span className="brand-timing-value">DNS record saved at registrar</span>
            </div>
            <div className="brand-timing-step">
              <span className="brand-timing-label">5-10 minutes:</span>
              <span className="brand-timing-value">Most DNS servers updated</span>
            </div>
            <div className="brand-timing-step">
              <span className="brand-timing-label">1-24 hours:</span>
              <span className="brand-timing-value">Global propagation complete</span>
            </div>
          </div>
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
              {verificationResult?.data?.brandedUrl || `https://${customDomain?.domain}/${customDomain?.brandedShortId}`}
              <button
                className="brand-copy-btn"
                onClick={() => copyToClipboard(
                  verificationResult?.data?.brandedUrl || `https://${customDomain?.domain}/${customDomain?.brandedShortId}`, 
                  'final'
                )}
              >
                {copied.final ? <FaCheck /> : <FaCopy />} Copy
              </button>
            </div>
          </div>
          
          <div className="brand-info-card">
            <div className="brand-info-label">Original URL</div>
            <div className="brand-info-value">
              {getShortUrl(selectedUrl)}
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
            <li>Share your branded URL: {verificationResult?.data?.brandedUrl || `https://${customDomain?.domain}/${customDomain?.brandedShortId}`}</li>
            <li>Track clicks in your analytics dashboard</li>
            <li>Add more domains from your dashboard</li>
            <li>Set this as your primary domain in settings</li>
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
              <div className="brand-step3-buttons">
                <button
                  className="brand-btn-secondary"
                  onClick={() => {
                    setVerificationResult(null);
                    toast.info('Refreshing DNS instructions...');
                  }}
                >
                  Refresh
                </button>
                <button
                  className="brand-btn-primary"
                  onClick={handleVerifyDomain}
                  disabled={verifying}
                >
                  {verifying ? (
                    <>
                      <FaSync className="brand-spin" /> Verifying...
                    </>
                  ) : (
                    'Verify Domain'
                  )}
                </button>
              </div>
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
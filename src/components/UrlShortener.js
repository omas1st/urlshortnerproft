import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdvancedSettings from './AdvancedSettings';
import { FaLink, FaCog, FaCopy, FaCheck } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';
import './UrlShortener.css';

const UrlShortener = ({ onGenerate, isDashboard = false }) => {
  const { user, saveRedirectUrl } = useAuth();
  const navigate = useNavigate();
  
  const [destinationUrl, setDestinationUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    password: '',
    expirationDate: null,
    previewImage: '',
    loadingPageImage: '',
    loadingPageText: '',
    brandColor: '#000000',
    splashImage: '',
    generateQrCode: false,
    smartDynamicLinks: false,
    destinations: [],
    enableAffiliateTracking: false,
    affiliateTag: ''
  });

  const validateUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    const trimmed = url.trim();
    if (!trimmed) return false;
    
    try {
      let testUrl = trimmed;
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }
      const urlObj = new URL(testUrl);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  // Preferred backend origin: REACT_APP_BACKEND_URL, otherwise attempt dev fallback
  const getBackendOrigin = () => {
    if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
    // dev fallback: if frontend running on :3000 assume backend on :5000
    try {
      const winOrigin = window.location.origin;
      return winOrigin.includes(':3000') ? winOrigin.replace(':3000', ':5000') : winOrigin;
    } catch (e) {
      return 'http://localhost:5000';
    }
  };

  const constructShortUrl = (shortId) => {
    return `${getBackendOrigin()}/s/${shortId}`;
  };

  const handleGenerate = async () => {
    if (!destinationUrl.trim()) {
      toast.error('Please enter a destination URL');
      return;
    }

    if (!validateUrl(destinationUrl)) {
      toast.error('Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }

    if (!user && !isDashboard) {
      const urlData = {
        destinationUrl,
        customName,
        advancedSettings
      };
      localStorage.setItem('pendingUrl', JSON.stringify(urlData));
      saveRedirectUrl('/');
      navigate('/login');
      return;
    }

    setLoading(true);
    setGeneratedUrl(null);
    try {
      const response = await api.post('/urls/shorten', {
        destinationUrl,
        customName,
        ...advancedSettings
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate URL');
      }

      const generatedData = response.data.url || response.data;
      // ensure we have a usable shortUrl fallback on the client
      if (!generatedData.shortUrl && generatedData.shortId) {
        generatedData.shortUrl = constructShortUrl(generatedData.shortId);
      }

      setGeneratedUrl(generatedData);
      toast.success('URL shortened successfully!');
      
      if (onGenerate) {
        onGenerate(generatedData);
      }

      // Clear form fields but keep generated URL visible
      setDestinationUrl('');
      setCustomName('');
      setAdvancedSettings({
        password: '',
        expirationDate: null,
        previewImage: '',
        loadingPageImage: '',
        loadingPageText: '',
        brandColor: '#000000',
        splashImage: '',
        generateQrCode: false,
        smartDynamicLinks: false,
        destinations: [],
        enableAffiliateTracking: false,
        affiliateTag: ''
      });

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate URL';
      toast.error(errorMsg);
      console.error('URL generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const createNewUrl = () => {
    setGeneratedUrl(null);
    setDestinationUrl('');
    setCustomName('');
  };

  return (
    <div className="url-shortener-container">
      <div className="shortener-card">
        <h2>
          <FaLink /> Shorten Your URL
        </h2>
        
        {!generatedUrl ? (
          <>
            <div className="input-group">
              <input
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="Paste your long URL here (e.g., https://example.com)"
                className="url-input"
                disabled={loading}
              />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Custom name (optional)"
                className="custom-input"
                disabled={loading}
              />
            </div>

            <div className="actions-row">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="settings-btn"
                disabled={loading}
              >
                <FaCog /> Additional Settings
              </button>
            </div>

            {showAdvanced && (
              <div className="advanced-section">
                <AdvancedSettings
                  settings={advancedSettings}
                  onChange={setAdvancedSettings}
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !destinationUrl}
              className="generate-btn"
            >
              {loading ? 'Generating...' : 'Generate Short Link'}
            </button>

            {!user && !isDashboard && (
              <p className="login-required">
                * You need to login to generate short links
              </p>
            )}
          </>
        ) : (
          <div className="generated-url-container">
            <div className="success-message">
              <h3>✅ URL Shortened Successfully!</h3>
              <p>Your short link has been created.</p>
            </div>
            
            <div className="url-display">
              <div className="url-info">
                <div className="url-row">
                  <span className="label">Short URL:</span>
                  <div className="short-url-display">
                    {/* Use server-provided shortUrl if available, otherwise construct one */}
                    <a 
                      href={generatedUrl.shortUrl || constructShortUrl(generatedUrl.shortId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-link"
                    >
                      {generatedUrl.shortUrl || constructShortUrl(generatedUrl.shortId)}
                    </a>
                    <button
                      onClick={() => copyToClipboard(generatedUrl.shortUrl || constructShortUrl(generatedUrl.shortId))}
                      className="copy-btn"
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                
                <div className="url-row">
                  <span className="label">Original URL:</span>
                  <span className="original-url">
                    {generatedUrl.destinationUrl}
                  </span>
                </div>
                
                {generatedUrl.customName && (
                  <div className="url-row">
                    <span className="label">Custom Name:</span>
                    <span className="custom-name">{generatedUrl.customName}</span>
                  </div>
                )}
                
                <div className="url-row">
                  <span className="label">Short ID:</span>
                  <span className="short-id">{generatedUrl.shortId}</span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button
                  onClick={() => copyToClipboard(generatedUrl.shortUrl || constructShortUrl(generatedUrl.shortId))}
                  className="primary-btn"
                >
                  <FaCopy /> Copy Short Link
                </button>
                <button
                  onClick={() => window.open(generatedUrl.shortUrl || constructShortUrl(generatedUrl.shortId), '_blank')}
                  className="secondary-btn"
                >
                  <FaLink /> Visit Short Link
                </button>
                <button
                  onClick={createNewUrl}
                  className="outline-btn"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortener;
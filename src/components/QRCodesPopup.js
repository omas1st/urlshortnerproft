// src/components/QRCodesPopup.js
import React, { useState } from 'react';
import { FaTimes, FaCopy, FaDownload, FaQrcode, FaLink, FaRedo } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './QRCodesPopup.css';

const QRCodesPopup = ({ qrCodesData, loading, onClose, onRefresh }) => {
  const [copiedStates, setCopiedStates] = useState({});
  const [qrCopiedStates, setQrCopiedStates] = useState({});

  const handleCopyLink = (url, shortId) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard!');
      setCopiedStates(prev => ({ ...prev, [shortId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [shortId]: false }));
      }, 2000);
    }).catch(err => {
      toast.error('Failed to copy URL');
    });
  };

  const handleCopyQRCode = async (qrCodeData, shortId) => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(qrCodeData);
      const blob = await base64Response.blob();
      
      // Copy blob to clipboard
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      
      toast.success('QR Code copied to clipboard!');
      setQrCopiedStates(prev => ({ ...prev, [shortId]: true }));
      setTimeout(() => {
        setQrCopiedStates(prev => ({ ...prev, [shortId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      toast.error('Failed to copy QR code');
    }
  };

  const handleDownloadQRCode = (qrCodeData, shortId) => {
    try {
      // Convert base64 to blob
      const base64Data = qrCodeData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${shortId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('QR Code downloaded!');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      toast.error('Failed to download QR code');
    }
  };

  const truncateUrl = (url, maxLength = 50) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="qr-codes-popup-overlay">
      <div className="qr-codes-popup">
        <div className="qr-codes-popup-header">
          <div className="popup-header-left">
            <FaQrcode className="popup-icon" />
            <h2>Your QR Codes</h2>
          </div>
          <div className="popup-header-right">
            <button 
              className="refresh-btn"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh QR Codes"
            >
              <FaRedo className={loading ? 'spin' : ''} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="qr-codes-popup-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading QR codes...</p>
            </div>
          ) : qrCodesData.length === 0 ? (
            <div className="empty-state">
              <FaQrcode className="empty-icon" />
              <h3>No QR Codes Found</h3>
              <p>Generate QR codes for your URLs by enabling the "Generate QR Code" option when creating or editing a URL.</p>
            </div>
          ) : (
            <div className="qr-codes-list">
              {qrCodesData.map((item) => (
                <div key={item._id || item.id} className="qr-code-item">
                  <div className="qr-code-header">
                    <div className="short-link-info">
                      <div className="short-link-display">
                        <FaLink className="link-icon" />
                        <a 
                          href={item.shortUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="short-link"
                          title={item.shortUrl}
                        >
                          {item.shortUrl ? item.shortUrl.replace(/^https?:\/\//, '').substring(0, 40) : 'N/A'}
                          {item.shortUrl && item.shortUrl.length > 40 ? '...' : ''}
                          <FiExternalLink className="external-icon" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(item.shortUrl, item.shortId)}
                          className={`copy-link-btn ${copiedStates[item.shortId] ? 'copied' : ''}`}
                          title="Copy Short Link"
                        >
                          <FaCopy />
                          {copiedStates[item.shortId] ? ' Copied!' : ''}
                        </button>
                      </div>
                      <div className="original-link">
                        <span className="label">Original: </span>
                        <span className="url" title={item.destinationUrl}>
                          {truncateUrl(item.destinationUrl)}
                        </span>
                      </div>
                    </div>
                    <div className="clicks-info">
                      <span className="clicks-count">{item.clicks || 0}</span>
                      <span className="clicks-label">clicks</span>
                    </div>
                  </div>
                  
                  <div className="qr-code-content">
                    {item.qrCodeData ? (
                      <div className="qr-code-image-container">
                        <img 
                          src={item.qrCodeData} 
                          alt={`QR Code for ${item.shortId}`} 
                          className="qr-code-image"
                        />
                        <div className="qr-code-actions">
                          <button
                            onClick={() => handleCopyQRCode(item.qrCodeData, item.shortId)}
                            className={`qr-action-btn copy-qr-btn ${qrCopiedStates[item.shortId] ? 'copied' : ''}`}
                          >
                            <FaCopy />
                            <span>{qrCopiedStates[item.shortId] ? 'Copied!' : 'Copy QR'}</span>
                          </button>
                          <button
                            onClick={() => handleDownloadQRCode(item.qrCodeData, item.shortId)}
                            className="qr-action-btn download-qr-btn"
                          >
                            <FaDownload />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ) : item.generateQrCode && !item.qrCodeData ? (
                      <div className="no-qr-code">
                        <FaQrcode className="no-qr-icon" />
                        <p>QR Code not generated yet</p>
                        <small>Edit this URL to generate QR code</small>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="qr-code-footer">
                    <div className="qr-meta">
                      {item.customName && (
                        <span className="custom-name">Alias: {item.customName}</span>
                      )}
                      <span className="created-date">
                        Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="qr-codes-popup-footer">
          <p className="qr-codes-count">
            Showing {qrCodesData.length} QR Code{qrCodesData.length !== 1 ? 's' : ''}
          </p>
          <button className="close-popup-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodesPopup;
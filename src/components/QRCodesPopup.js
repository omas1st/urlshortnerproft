// src/components/QRCodesPopup.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCopy, FaDownload, FaQrcode, FaLink, FaRedo, FaEdit, FaPalette, FaImage, FaTextHeight, FaHistory, FaCodeBranch, FaShareAlt } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import './QRCodesPopup.css';

const QRCodesPopup = ({ qrCodesData, loading, onClose, onRefresh }) => {
  const [copiedStates, setCopiedStates] = useState({});
  const [qrCopiedStates, setQrCopiedStates] = useState({});
  const [editingQR, setEditingQR] = useState(null);
  const [qrCustomizations, setQrCustomizations] = useState({});
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showABTesting, setShowABTesting] = useState(false);
  const [selectedUrlForActions, setSelectedUrlForActions] = useState(null);
  const [sharingQR, setSharingQR] = useState(null);

  // Initialize customizations for each QR code
  useEffect(() => {
    const initialCustomizations = {};
    qrCodesData.forEach(item => {
      if (item.shortId) {
        initialCustomizations[item.shortId] = {
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF',
          logo: null,
          logoSize: 15,
          text: '',
          textColor: '#000000',
          textSize: 14,
          qrSize: 300,
          margin: 1,
          errorCorrectionLevel: 'H'
        };
      }
    });
    setQrCustomizations(initialCustomizations);
  }, [qrCodesData]);

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

  const handleShareQRCode = async (item) => {
    try {
      const qrCodeData = item.qrCodeData;
      
      // Convert base64 to blob
      const base64Response = await fetch(qrCodeData);
      const blob = await base64Response.blob();
      
      // Create a file from blob
      const fileName = `qr-code-${item.shortId || item.customName}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `QR Code for ${item.customName || item.shortId}`,
            text: `Scan this QR code to visit: ${item.shortUrl}\n\nOriginal URL: ${item.destinationUrl}`,
            files: [file]
          });
          toast.success('QR Code shared successfully!');
        } catch (shareError) {
          console.error('Web Share API error:', shareError);
          fallbackShare(item, qrCodeData);
        }
      } else {
        fallbackShare(item, qrCodeData);
      }
    } catch (err) {
      console.error('Failed to share QR code:', err);
      toast.error('Failed to share QR code');
    }
  };

  const fallbackShare = (item, qrCodeData) => {
    setSharingQR(item.shortId);
  };

  const copyQRCodeLink = (qrCodeData) => {
    navigator.clipboard.writeText(qrCodeData).then(() => {
      toast.success('QR Code image link copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy QR code link');
    });
  };

  const shareViaEmail = (item, qrCodeData) => {
    const subject = `QR Code for ${item.customName || item.shortId}`;
    const body = `Scan this QR code to visit: ${item.shortUrl}\n\nOriginal URL: ${item.destinationUrl}\n\nQR Code Image: ${qrCodeData}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    setSharingQR(null);
  };

  const shareViaWhatsApp = (item) => {
    const text = `QR Code for ${item.customName || item.shortId}\n\nScan this QR code to visit: ${item.shortUrl}\n\nOriginal URL: ${item.destinationUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappLink, '_blank');
    setSharingQR(null);
  };

  const shareViaFacebook = (item, qrCodeData) => {
    const text = `Check out this QR code for ${item.customName || item.shortId}`;
    const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(item.shortUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookLink, '_blank');
    setSharingQR(null);
  };

  const shareViaTwitter = (item) => {
    const text = `Check out this QR code for ${item.customName || item.shortId}\n\n${item.shortUrl}`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterLink, '_blank');
    setSharingQR(null);
  };

  const truncateUrl = (url, maxLength = 50) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // QR Code Customization Functions
  const openEditQRCode = (item) => {
    setEditingQR(item.shortId);
  };

  const handleColorChange = (shortId, colorType, value) => {
    setQrCustomizations(prev => ({
      ...prev,
      [shortId]: {
        ...prev[shortId],
        [colorType]: value
      }
    }));
  };

  const handleLogoUpload = (shortId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrCustomizations(prev => ({
          ...prev,
          [shortId]: {
            ...prev[shortId],
            logo: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (shortId) => {
    setQrCustomizations(prev => ({
      ...prev,
      [shortId]: {
        ...prev[shortId],
        logo: null
      }
    }));
  };

  const handleTextChange = (shortId, text) => {
    setQrCustomizations(prev => ({
      ...prev,
      [shortId]: {
        ...prev[shortId],
        text: text
      }
    }));
  };

  const generateCustomQRCode = async (item) => {
    try {
      const customization = qrCustomizations[item.shortId];
      if (!customization) return item.qrCodeData;

      // Create a canvas for QR code
      const canvas = document.createElement('canvas');
      canvas.width = customization.qrSize;
      canvas.height = customization.qrSize + (customization.text ? 50 : 0);
      const ctx = canvas.getContext('2d');

      // Draw background
      ctx.fillStyle = customization.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate QR code
      const qrOptions = {
        width: customization.qrSize,
        margin: customization.margin,
        color: {
          dark: customization.foregroundColor,
          light: customization.backgroundColor
        },
        errorCorrectionLevel: customization.errorCorrectionLevel
      };

      const qrDataUrl = await QRCode.toDataURL(item.shortUrl, qrOptions);
      
      // Load QR code image
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      
      await new Promise((resolve) => {
        qrImg.onload = resolve;
      });

      // Draw QR code
      ctx.drawImage(qrImg, 0, 0, customization.qrSize, customization.qrSize);

      // Draw logo if exists
      if (customization.logo) {
        const logoSize = customization.qrSize * (customization.logoSize / 100);
        const logoX = (customization.qrSize - logoSize) / 2;
        const logoY = (customization.qrSize - logoSize) / 2;
        
        const logoImg = new Image();
        logoImg.src = customization.logo;
        
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });
        
        // Draw white background for logo
        ctx.fillStyle = '#FFFFFF';
        const bgPadding = 4;
        ctx.fillRect(logoX - bgPadding, logoY - bgPadding, logoSize + (bgPadding * 2), logoSize + (bgPadding * 2));
        
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      }

      // Add text if exists
      if (customization.text) {
        ctx.fillStyle = customization.textColor;
        ctx.font = `bold ${customization.textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(customization.text, customization.qrSize / 2, customization.qrSize + 20);
      }

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating custom QR code:', error);
      toast.error('Failed to generate custom QR code');
      return item.qrCodeData;
    }
  };

  const saveCustomQRCode = async (shortId) => {
    const item = qrCodesData.find(qr => qr.shortId === shortId);
    if (!item) return;

    try {
      const customQR = await generateCustomQRCode(item);
      
      // Update the QR code in the list (temporary - in real app, this would be saved to backend)
      item.qrCodeData = customQR;
      
      toast.success('QR Code customized successfully!');
      setEditingQR(null);
    } catch (error) {
      console.error('Error saving custom QR code:', error);
      toast.error('Failed to save custom QR code');
    }
  };

  const openVersionHistory = (item) => {
    setSelectedUrlForActions(item);
    setShowVersionHistory(true);
  };

  const openABTesting = (item) => {
    setSelectedUrlForActions(item);
    setShowABTesting(true);
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
                            onClick={() => openEditQRCode(item)}
                            className="qr-action-btn edit-qr-btn"
                            title="Customize QR Code"
                          >
                            <FaEdit />
                            <span>Customize</span>
                          </button>
                          <button
                            onClick={() => handleCopyQRCode(item.qrCodeData, item.shortId)}
                            className={`qr-action-btn copy-qr-btn ${qrCopiedStates[item.shortId] ? 'copied' : ''}`}
                          >
                            <FaCopy />
                            <span>{qrCopiedStates[item.shortId] ? 'Copied!' : 'Copy QR'}</span>
                          </button>
                          <button
                            onClick={() => handleShareQRCode(item)}
                            className="qr-action-btn share-qr-btn"
                            title="Share QR Code"
                          >
                            <FaShareAlt />
                            <span>Share</span>
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
                    <div className="qr-additional-actions">
                      <button
                        onClick={() => openVersionHistory(item)}
                        className="additional-action-btn version-history-btn"
                        title="Version History"
                      >
                        <FaHistory />
                        <span>History</span>
                      </button>
                      <button
                        onClick={() => openABTesting(item)}
                        className="additional-action-btn ab-testing-btn"
                        title="A/B Testing"
                      >
                        <FaCodeBranch />
                        <span>A/B Test</span>
                      </button>
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

      {/* Edit QR Code Modal */}
      {editingQR && (
        <div className="edit-qr-modal-overlay">
          <div className="edit-qr-modal">
            <div className="edit-qr-modal-header">
              <h3>
                <FaPalette /> Customize QR Code
              </h3>
              <button className="close-btn" onClick={() => setEditingQR(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="edit-qr-modal-content">
              <div className="qr-customization-section">
                <div className="customization-preview">
                  <h4>Preview</h4>
                  <div className="preview-container">
                    {(() => {
                      const item = qrCodesData.find(qr => qr.shortId === editingQR);
                      const customization = qrCustomizations[editingQR];
                      return (
                        <div className="qr-preview">
                          <img 
                            src={item.qrCodeData} 
                            alt="QR Preview" 
                            style={{
                              filter: `drop-shadow(0 0 5px ${customization?.foregroundColor || '#000000'}40)`,
                              maxWidth: '200px'
                            }}
                          />
                          {customization?.text && (
                            <p style={{
                              color: customization.textColor,
                              fontSize: `${customization.textSize}px`,
                              marginTop: '10px',
                              fontWeight: 'bold'
                            }}>
                              {customization.text}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="customization-controls">
                  <div className="control-group">
                    <h4><FaPalette /> Colors</h4>
                    <div className="color-controls">
                      <div className="color-control">
                        <label>QR Color</label>
                        <input
                          type="color"
                          value={qrCustomizations[editingQR]?.foregroundColor || '#000000'}
                          onChange={(e) => handleColorChange(editingQR, 'foregroundColor', e.target.value)}
                        />
                      </div>
                      <div className="color-control">
                        <label>Background</label>
                        <input
                          type="color"
                          value={qrCustomizations[editingQR]?.backgroundColor || '#FFFFFF'}
                          onChange={(e) => handleColorChange(editingQR, 'backgroundColor', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="control-group">
                    <h4><FaImage /> Logo</h4>
                    <div className="logo-controls">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(editingQR, e)}
                        id={`logo-upload-${editingQR}`}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor={`logo-upload-${editingQR}`}
                        className="upload-logo-btn"
                      >
                        Upload Logo
                      </label>
                      {qrCustomizations[editingQR]?.logo && (
                        <>
                          <div className="logo-preview-small">
                            <img src={qrCustomizations[editingQR].logo} alt="Logo" />
                          </div>
                          <button
                            onClick={() => removeLogo(editingQR)}
                            className="remove-logo-btn"
                          >
                            Remove
                          </button>
                          <div className="logo-size-control">
                            <label>Logo Size: {qrCustomizations[editingQR].logoSize}%</label>
                            <input
                              type="range"
                              min="5"
                              max="30"
                              value={qrCustomizations[editingQR].logoSize}
                              onChange={(e) => setQrCustomizations(prev => ({
                                ...prev,
                                [editingQR]: {
                                  ...prev[editingQR],
                                  logoSize: parseInt(e.target.value)
                                }
                              }))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="control-group">
                    <h4><FaTextHeight /> Text</h4>
                    <div className="text-controls">
                      <input
                        type="text"
                        placeholder="Add text below QR code"
                        value={qrCustomizations[editingQR]?.text || ''}
                        onChange={(e) => handleTextChange(editingQR, e.target.value)}
                        className="text-input"
                      />
                      <div className="text-styling">
                        <div className="text-color-control">
                          <label>Text Color</label>
                          <input
                            type="color"
                            value={qrCustomizations[editingQR]?.textColor || '#000000'}
                            onChange={(e) => setQrCustomizations(prev => ({
                              ...prev,
                              [editingQR]: {
                                ...prev[editingQR],
                                textColor: e.target.value
                              }
                            }))}
                          />
                        </div>
                        <div className="text-size-control">
                          <label>Text Size: {qrCustomizations[editingQR]?.textSize || 14}px</label>
                          <input
                            type="range"
                            min="10"
                            max="24"
                            value={qrCustomizations[editingQR]?.textSize || 14}
                            onChange={(e) => setQrCustomizations(prev => ({
                              ...prev,
                              [editingQR]: {
                                ...prev[editingQR],
                                textSize: parseInt(e.target.value)
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="control-group">
                    <h4>Advanced Settings</h4>
                    <div className="advanced-controls">
                      <div className="qr-size-control">
                        <label>QR Size: {qrCustomizations[editingQR]?.qrSize || 300}px</label>
                        <input
                          type="range"
                          min="200"
                          max="500"
                          step="50"
                          value={qrCustomizations[editingQR]?.qrSize || 300}
                          onChange={(e) => setQrCustomizations(prev => ({
                            ...prev,
                            [editingQR]: {
                              ...prev[editingQR],
                              qrSize: parseInt(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div className="margin-control">
                        <label>Margin: {qrCustomizations[editingQR]?.margin || 1}</label>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          step="1"
                          value={qrCustomizations[editingQR]?.margin || 1}
                          onChange={(e) => setQrCustomizations(prev => ({
                            ...prev,
                            [editingQR]: {
                              ...prev[editingQR],
                              margin: parseInt(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="edit-qr-modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setEditingQR(null)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={() => saveCustomQRCode(editingQR)}
              >
                Save Custom QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share QR Code Modal */}
      {sharingQR && (() => {
        const item = qrCodesData.find(qr => qr.shortId === sharingQR);
        if (!item) return null;
        
        return (
          <div className="action-modal-overlay">
            <div className="action-modal share-modal">
              <div className="action-modal-header">
                <h3><FaShareAlt /> Share QR Code: {item.customName || item.shortId}</h3>
                <button className="close-btn" onClick={() => setSharingQR(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="action-modal-content">
                <div className="share-options">
                  <div className="share-preview">
                    <img src={item.qrCodeData} alt="QR Code to share" className="share-qr-image" />
                    <div className="share-info">
                      <h4>{item.customName || item.shortId}</h4>
                      <p className="share-url">{item.shortUrl}</p>
                      <p className="share-original">Original: {truncateUrl(item.destinationUrl, 40)}</p>
                    </div>
                  </div>
                  
                  <div className="share-methods">
                    <h4>Share via:</h4>
                    <div className="share-buttons-grid">
                      <button 
                        className="share-method-btn email-btn"
                        onClick={() => shareViaEmail(item, item.qrCodeData)}
                      >
                        <div className="share-icon">✉️</div>
                        <span>Email</span>
                      </button>
                      
                      <button 
                        className="share-method-btn whatsapp-btn"
                        onClick={() => shareViaWhatsApp(item)}
                      >
                        <div className="share-icon">💬</div>
                        <span>WhatsApp</span>
                      </button>
                      
                      <button 
                        className="share-method-btn facebook-btn"
                        onClick={() => shareViaFacebook(item, item.qrCodeData)}
                      >
                        <div className="share-icon">f</div>
                        <span>Facebook</span>
                      </button>
                      
                      <button 
                        className="share-method-btn twitter-btn"
                        onClick={() => shareViaTwitter(item)}
                      >
                        <div className="share-icon">🐦</div>
                        <span>Twitter</span>
                      </button>
                      
                      <button 
                        className="share-method-btn copy-link-btn"
                        onClick={() => copyQRCodeLink(item.qrCodeData)}
                      >
                        <div className="share-icon">🔗</div>
                        <span>Copy Link</span>
                      </button>
                      
                      <button 
                        className="share-method-btn download-share-btn"
                        onClick={() => {
                          handleDownloadQRCode(item.qrCodeData, item.shortId);
                          setSharingQR(null);
                        }}
                      >
                        <div className="share-icon">📥</div>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="share-custom-message">
                    <label>Custom Message (optional):</label>
                    <textarea 
                      placeholder="Add a custom message when sharing..."
                      defaultValue={`Check out this QR code for ${item.customName || item.shortId}!\n\nScan to visit: ${item.shortUrl}`}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <div className="action-modal-footer">
                <button 
                  className="cancel-action-btn" 
                  onClick={() => setSharingQR(null)}
                >
                  Cancel
                </button>
                <button 
                  className="copy-all-btn"
                  onClick={() => {
                    const text = `QR Code for ${item.customName || item.shortId}\n\nScan this QR code to visit: ${item.shortUrl}\n\nOriginal URL: ${item.destinationUrl}\n\nQR Code Image: ${item.qrCodeData}`;
                    navigator.clipboard.writeText(text).then(() => {
                      toast.success('All information copied to clipboard!');
                    });
                  }}
                >
                  Copy All Info
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Version History Modal */}
      {showVersionHistory && selectedUrlForActions && (
        <div className="action-modal-overlay">
          <div className="action-modal">
            <div className="action-modal-header">
              <h3><FaHistory /> Version History: {selectedUrlForActions.customName || selectedUrlForActions.shortId}</h3>
              <button className="close-btn" onClick={() => setShowVersionHistory(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="action-modal-content">
              <div className="version-history-list">
                <p>Version history feature is coming soon!</p>
                <p>Track all changes made to your URL over time.</p>
                <div className="version-history-example">
                  <div className="version-item">
                    <div className="version-header">
                      <span className="version-number">Version 1.0</span>
                      <span className="version-date">Today, 10:30 AM</span>
                    </div>
                    <p className="version-changes">QR Code customized with new colors and logo</p>
                  </div>
                  <div className="version-item">
                    <div className="version-header">
                      <span className="version-number">Version 0.9</span>
                      <span className="version-date">Yesterday, 15:45 PM</span>
                    </div>
                    <p className="version-changes">Destination URL updated</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="close-action-btn" onClick={() => setShowVersionHistory(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A/B Testing Modal */}
      {showABTesting && selectedUrlForActions && (
        <div className="action-modal-overlay">
          <div className="action-modal">
            <div className="action-modal-header">
              <h3><FaCodeBranch /> A/B Testing: {selectedUrlForActions.customName || selectedUrlForActions.shortId}</h3>
              <button className="close-btn" onClick={() => setShowABTesting(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="action-modal-content">
              <div className="ab-testing-setup">
                <p>Set up A/B testing for your URL:</p>
                <div className="ab-testing-form">
                  <div className="form-group">
                    <label>Test Name</label>
                    <input type="text" placeholder="Enter test name" />
                  </div>
                  <div className="variants-section">
                    <h4>Variants</h4>
                    <div className="variant">
                      <label>Variant A (Control)</label>
                      <input type="text" value={selectedUrlForActions.destinationUrl} readOnly />
                    </div>
                    <div className="variant">
                      <label>Variant B</label>
                      <input type="text" placeholder="Enter alternative destination URL" />
                    </div>
                  </div>
                  <div className="traffic-split">
                    <h4>Traffic Split</h4>
                    <div className="split-controls">
                      <label>
                        <input type="radio" name="split" defaultChecked /> 50% A / 50% B
                      </label>
                      <label>
                        <input type="radio" name="split" /> 70% A / 30% B
                      </label>
                      <label>
                        <input type="radio" name="split" /> 30% A / 70% B
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="cancel-action-btn" onClick={() => setShowABTesting(false)}>
                Cancel
              </button>
              <button className="start-test-btn" onClick={() => {
                toast.success('A/B Testing started!');
                setShowABTesting(false);
              }}>
                Start A/B Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodesPopup;
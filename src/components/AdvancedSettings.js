import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import {
  FaLock,
  FaCalendarAlt,
  FaImage,
  FaQrcode,
  FaLayerGroup,
  FaChartLine,
  FaBolt,
  FaRobot,
  FaGlobe,
  FaMobile,
  FaDesktop,
  FaClock,
  FaInfoCircle,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * AdvancedSettings component
 * Props:
 *  - settings: object with existing settings
 *  - onChange: function(newSettings) => void
 *
 * Note: Cloudinary upload uses:
 *   process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
 *   (preset used: 'url_shortener')
 */

// Toggle this to true if you want Smart Dynamic Links UI to reappear.
const ENABLE_SMART_DYNAMIC_LINKS = false;

// Toggle this to true when you want the Affiliate Tracking UI to appear again.
const ENABLE_AFFILIATE = false;

const AdvancedSettings = ({ settings = {}, onChange }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showRuleGuide, setShowRuleGuide] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    setUploadError(''); // Clear error when toggling section
  };

  const handleChange = (key, value) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  // Helper to update nested arrays / objects
  const updateDestinations = (newDests) => {
    handleChange('destinations', newDests);
  };

  // Cloudinary upload for splash image (client-side)
  const handleFileUpload = async (e, key) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Clear previous errors
    setUploadError('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File is too large (max 5MB).');
      return;
    }

    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'url_shortener';
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      console.error('CLOUDINARY_CLOUD_NAME not set in environment');
      setUploadError('Upload configuration error. Please contact support.');
      return;
    }

    if (!uploadPreset) {
      console.error('CLOUDINARY_UPLOAD_PRESET not set in environment');
      setUploadError('Upload configuration error. Please contact support.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'url_shortener'); // Specify folder for organization

    try {
      setUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { 
          method: 'POST', 
          body: formData 
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Cloudinary upload failed:', data);
        
        // Provide more specific error messages
        if (data.error && data.error.message) {
          setUploadError(`Upload failed: ${data.error.message}`);
        } else if (res.status === 401) {
          setUploadError('Upload failed: Invalid Cloudinary configuration. Please check your upload preset.');
        } else {
          setUploadError('Upload failed. Please try again or use a different image.');
        }
        return;
      }
      
      // store secure_url
      handleChange(key, data.secure_url || data.url || null);
      
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setUploadError('Network error. Please check your internet connection and try again.');
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      // Reset the file input to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const removeSplash = () => {
    handleChange('splashImage', null);
  };

  // DESTINATIONS helpers
  const addDestination = () => {
    const newDests = [...(settings.destinations || []), {
      url: '',
      rule: 'country:',
      ruleType: 'country',
      ruleValue: '',
      weight: 1
    }];
    updateDestinations(newDests);
    setExpandedSection('multiple'); // open section
  };

  const updateDestinationField = (index, field, value) => {
    const newDests = [...(settings.destinations || [])];
    newDests[index] = { ...newDests[index], [field]: value };

    // Keep rule in sync with ruleType and ruleValue
    if (field === 'ruleType' || field === 'ruleValue') {
      const rt = (newDests[index].ruleType || newDests[index].rule?.split(':')[0] || 'country').toString();
      const rv = (newDests[index].ruleValue || newDests[index].rule?.split(':').slice(1).join(':') || '').toString();
      newDests[index].rule = `${rt}:${rv}`;
      newDests[index].ruleType = rt;
      newDests[index].ruleValue = rv;
    }

    // If updating url, keep it raw (backend will normalize) but trim
    if (field === 'url') newDests[index].url = value ? value.trim() : value;

    // Ensure weight is at least 1
    if (field === 'weight') {
      const w = parseInt(value, 10);
      newDests[index].weight = Number.isFinite(w) && w > 0 ? w : 1;
    }

    updateDestinations(newDests);
  };

  const removeDestination = (index) => {
    const newDests = (settings.destinations || []).filter((_, i) => i !== index);
    updateDestinations(newDests);
  };

  // Simple rule guide (same as earlier)
  const ruleGuide = {
    country: "Format: country:US (ISO country code)",
    device: "Format: device:mobile (options: mobile, desktop, tablet)",
    browser: "Format: browser:chrome (options: chrome, firefox, safari, edge)",
    time: "Format: time:09-17 (24-hour format, e.g., 09-17 means 9AM to 5PM)",
    os: "Format: os:ios (options: ios, android, windows, mac, linux)",
    referrer: "Format: referrer:google.com (domain name)",
    language: "Format: language:en (language code)"
  };

  const renderRuleGuide = () => (
    <div className="rule-guide" style={{ padding: 10, background: '#fff', borderRadius: 8, marginTop: 10 }}>
      <h4><FaInfoCircle /> Rule Format Guide</h4>
      <ul>
        {Object.entries(ruleGuide).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {value}</li>
        ))}
      </ul>
      <button type="button" onClick={() => setShowRuleGuide(false)} style={{ marginTop: 8 }}>Close</button>
    </div>
  );

  return (
    <div className="advanced-settings" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Advanced Settings <FaBolt />
      </h3>

      {/* Password Protection */}
      <div className="setting-section" style={{ marginTop: 16 }}>
        <button className="section-header" type="button" onClick={() => toggleSection('password')} style={sectionButtonStyle}>
          <FaLock /> Password Protection
        </button>
        {expandedSection === 'password' && (
          <div className="section-content" style={sectionContentStyle}>
            <input
              type="password"
              placeholder="Set password for this link (optional)"
              value={settings.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              style={inputStyle}
            />
            <small className="help-text">Visitors will need to enter this password to access the link</small>
          </div>
        )}
      </div>

      {/* Expiration */}
      <div className="setting-section" style={{ marginTop: 12 }}>
        <button className="section-header" type="button" onClick={() => toggleSection('expiration')} style={sectionButtonStyle}>
          <FaCalendarAlt /> Link Expiration
        </button>
        {expandedSection === 'expiration' && (
          <div className="section-content" style={sectionContentStyle}>
            <DatePicker
              selected={settings.expirationDate ? new Date(settings.expirationDate) : null}
              onChange={(date) => handleChange('expirationDate', date ? date.toISOString() : null)}
              showTimeSelect
              dateFormat="Pp"
              minDate={new Date()}
              placeholderText="Select expiration date and time"
              style={inputStyle}
            />
            <small className="help-text">Link will stop working after this date</small>
          </div>
        )}
      </div>

      {/* Splash Screen */}
      <div className="setting-section" style={{ marginTop: 12 }}>
        <button className="section-header" type="button" onClick={() => toggleSection('splash')} style={sectionButtonStyle}>
          <FaImage /> Splash Screen
        </button>
        {expandedSection === 'splash' && (
          <div className="section-content" style={sectionContentStyle}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'splashImage')}
              id="splash-image-upload"
              style={{ marginBottom: 8 }}
            />
            {uploading && <p style={{ marginTop: 8, color: '#666' }}>Uploading image...</p>}
            {uploadError && (
              <div style={{ marginTop: 8, padding: 8, background: '#ffebee', borderRadius: 4, border: '1px solid #ffcdd2' }}>
                <p style={{ color: '#c62828', margin: 0, fontSize: 14 }}>{uploadError}</p>
              </div>
            )}
            <small className="help-text" style={{ display: 'block', marginTop: 8 }}>
              This image will show before redirecting visitors (Max: 5MB, Supported: JPEG, PNG, GIF, WebP)
            </small>
            {settings.splashImage && (
              <div className="image-preview" style={{ marginTop: 16 }}>
                <h5 style={{ marginBottom: 8 }}>Preview:</h5>
                <img 
                  src={settings.splashImage} 
                  alt="Splash Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    borderRadius: 8,
                    border: '1px solid #e0e0e0',
                    objectFit: 'contain'
                  }} 
                />
                <div style={{ marginTop: 12 }}>
                  <button 
                    type="button" 
                    onClick={removeSplash} 
                    style={{
                      ...smallBtnStyle,
                      background: '#ffebee',
                      color: '#c62828',
                      borderColor: '#ffcdd2'
                    }}
                  >
                    Remove Splash Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="setting-section" style={{ marginTop: 12 }}>
        <button className="section-header" type="button" onClick={() => toggleSection('qrcode')} style={sectionButtonStyle}>
          <FaQrcode /> Generate QR Code
        </button>
        {expandedSection === 'qrcode' && (
          <div className="section-content" style={sectionContentStyle}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.generateQrCode || false}
                onChange={(e) => handleChange('generateQrCode', e.target.checked)}
              />
              <span>Generate QR Code with link</span>
            </label>
            <small className="help-text">Generate an embedded QR code (data URL)</small>
          </div>
        )}
      </div>

      {/* Smart Dynamic Links - HIDDEN by feature flag */}
      {ENABLE_SMART_DYNAMIC_LINKS && (
        <div className="setting-section" style={{ marginTop: 12 }}>
          <button className="section-header" type="button" onClick={() => toggleSection('dynamic')} style={sectionButtonStyle}>
            <FaRobot /> Smart Dynamic Links
          </button>
          {expandedSection === 'dynamic' && (
            <div className="section-content" style={sectionContentStyle}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.smartDynamicLinks || false}
                  onChange={(e) => handleChange('smartDynamicLinks', e.target.checked)}
                />
                <span>Enable Smart Dynamic Links</span>
              </label>

              {settings.smartDynamicLinks && (
                <div className="dynamic-options" style={{ marginTop: 12 }}>
                  <h4>Dynamic Rules Configuration</h4>

                  <div className="rule-item" style={{ marginTop: 8 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}><FaGlobe /> Country-Based Redirection:</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Country Code (e.g., US)"
                        value={settings.countryCode || ''}
                        onChange={(e) => handleChange('countryCode', e.target.value)}
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Destination URL for this country"
                        value={settings.countryDestination || ''}
                        onChange={(e) => handleChange('countryDestination', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="rule-item" style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}><FaMobile /> <FaDesktop /> Device-Based Redirection:</label>
                    <div className="device-rules" style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 80 }}>Android:</span>
                        <input
                          type="text"
                          placeholder="Android destination URL"
                          value={settings.androidDestination || ''}
                          onChange={(e) => handleChange('androidDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 80 }}>iPhone:</span>
                        <input
                          type="text"
                          placeholder="iPhone destination URL"
                          value={settings.iphoneDestination || ''}
                          onChange={(e) => handleChange('iphoneDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 80 }}>Desktop:</span>
                        <input
                          type="text"
                          placeholder="Desktop destination URL"
                          value={settings.desktopDestination || ''}
                          onChange={(e) => handleChange('desktopDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 80 }}>Tablet:</span>
                        <input
                          type="text"
                          placeholder="Tablet destination URL"
                          value={settings.tabletDestination || ''}
                          onChange={(e) => handleChange('tabletDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rule-item" style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}><FaClock /> Time-Based Redirection:</label>
                    <div className="time-rules" style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 100 }}>Morning (6AM-12PM):</span>
                        <input
                          type="text"
                          placeholder="Morning destination URL"
                          value={settings.morningDestination || ''}
                          onChange={(e) => handleChange('morningDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 100 }}>Afternoon (12PM-6PM):</span>
                        <input
                          type="text"
                          placeholder="Afternoon destination URL"
                          value={settings.afternoonDestination || ''}
                          onChange={(e) => handleChange('afternoonDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 100 }}>Evening (6PM-12AM):</span>
                        <input
                          type="text"
                          placeholder="Evening destination URL"
                          value={settings.eveningDestination || ''}
                          onChange={(e) => handleChange('eveningDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ width: 100 }}>Night (12AM-6AM):</span>
                        <input
                          type="text"
                          placeholder="Night destination URL"
                          value={settings.nightDestination || ''}
                          onChange={(e) => handleChange('nightDestination', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Multiple Destinations (Rule builder + A/B like routing) */}
      <div className="setting-section" style={{ marginTop: 12 }}>
        <button className="section-header" type="button" onClick={() => toggleSection('multiple')} style={sectionButtonStyle}>
          <FaLayerGroup /> Multiple Destinations
        </button>
        {expandedSection === 'multiple' && (
          <div className="section-content" style={sectionContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Destination Rules</h4>
              <div>
                <button type="button" onClick={() => setShowRuleGuide(!showRuleGuide)} style={smallBtnStyle}><FaInfoCircle /> Rule Guide</button>
                <button type="button" onClick={addDestination} style={{ ...smallBtnStyle, marginLeft: 8 }}><FaPlus /> Add</button>
              </div>
            </div>

            {showRuleGuide && renderRuleGuide()}

            {(settings.destinations || []).length === 0 && (
              <p style={{ marginTop: 8, color: '#666' }}>No destination rules yet — add one to enable conditional routing.</p>
            )}

            {(settings.destinations || []).map((dest, index) => (
              <div key={index} style={{ border: '1px solid #eee', padding: 10, borderRadius: 8, marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={dest.ruleType || dest.rule?.split(':')[0] || 'country'}
                    onChange={(e) => updateDestinationField(index, 'ruleType', e.target.value)}
                    style={{ minWidth: 140, padding: 8 }}
                  >
                    <option value="country">Country</option>
                    <option value="device">Device</option>
                    <option value="browser">Browser</option>
                    <option value="time">Time of Day</option>
                    <option value="os">Operating System</option>
                    <option value="referrer">Referrer</option>
                    <option value="language">Language</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Rule value (e.g., US, mobile, chrome, 09-17)"
                    value={dest.ruleValue || dest.rule?.split(':').slice(1).join(':') || ''}
                    onChange={(e) => updateDestinationField(index, 'ruleValue', e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: 8 }}
                  />

                  <input
                    type="text"
                    placeholder="Destination URL"
                    value={dest.url || ''}
                    onChange={(e) => updateDestinationField(index, 'url', e.target.value)}
                    style={{ flex: 1, minWidth: 240, padding: 8 }}
                  />

                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={dest.weight || 1}
                    onChange={(e) => updateDestinationField(index, 'weight', e.target.value)}
                    style={{ width: 90, padding: 8 }}
                  />

                  <button type="button" onClick={() => removeDestination(index)} style={{ ...smallBtnStyle, background: '#ffdddd', color: '#900' }}><FaTrash /></button>
                </div>
                <div style={{ marginTop: 8, color: '#6b6b6b' }}>
                  <small>Rule stored as: <code>{(dest.ruleType || dest.rule?.split(':')[0]) + ':' + (dest.ruleValue || dest.rule?.split(':').slice(1).join(':') || '')}</code></small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Affiliate Tracking - wrapped in feature flag so it's hidden for now without deletion */}
      {ENABLE_AFFILIATE && (
        <div className="setting-section" style={{ marginTop: 12 }}>
          <button className="section-header" type="button" onClick={() => toggleSection('affiliate')} style={sectionButtonStyle}>
            <FaChartLine /> Affiliate Tracking
          </button>
          {expandedSection === 'affiliate' && (
            <div className="section-content" style={sectionContentStyle}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.enableAffiliateTracking || false}
                  onChange={(e) => handleChange('enableAffiliateTracking', e.target.checked)}
                />
                <span>Enable Affiliate Performance Tracking</span>
              </label>

              {settings.enableAffiliateTracking && (
                <div className="affiliate-fields" style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Affiliate ID"
                      value={settings.affiliateId || ''}
                      onChange={(e) => handleChange('affiliateId', e.target.value)}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Affiliate Tag"
                      value={settings.affiliateTag || ''}
                      onChange={(e) => handleChange('affiliateTag', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Commission Rate (%)"
                      value={settings.commissionRate || ''}
                      onChange={(e) => handleChange('commissionRate', e.target.value)}
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Cookie Duration (days)"
                      value={settings.cookieDuration || ''}
                      onChange={(e) => handleChange('cookieDuration', e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Custom Parameters (utm...)</label>
                    <textarea
                      placeholder="utm_source=affiliate&utm_medium=referral"
                      value={settings.customParams || ''}
                      onChange={(e) => handleChange('customParams', e.target.value)}
                      rows="3"
                      style={{ width: '100%', padding: 8 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6 }}>Conversion Pixel</label>
                    <textarea
                      placeholder="Paste conversion tracking pixel code"
                      value={settings.conversionPixel || ''}
                      onChange={(e) => handleChange('conversionPixel', e.target.value)}
                      rows="3"
                      style={{ width: '100%', padding: 8 }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer small helpers */}

    </div>
  );
};

/* ---------------------- Inline styles ---------------------- */
const sectionButtonStyle = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  width: '100%',
  padding: '10px 12px',
  background: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 15,
  textAlign: 'left'
};

const sectionContentStyle = {
  marginTop: 10,
  padding: 12,
  background: '#ffffff',
  borderRadius: 8,
  border: '1px solid #eef2f6'
};

const inputStyle = {
  padding: 8,
  borderRadius: 6,
  border: '1px solid #e6e9ee',
  width: '100%'
};

const smallBtnStyle = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #ddd',
  background: '#f7f7f8',
  cursor: 'pointer'
};

export default AdvancedSettings;

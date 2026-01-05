import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCopy, FaEdit, FaTrash, FaQrcode, FaChartBar, FaLock, FaUnlock, FaLink, FaDownload } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../services/api'; // <-- use centralized api instance

const CopyButton = ({ text, className = '', children }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${className} ${isCopied ? 'copied' : ''}`}
      title={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      {children || (
        <>
          <FaCopy />
          {isCopied ? ' Copied!' : ' Copy'}
        </>
      )}
    </button>
  );
};

const GeneratedUrls = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    destinationUrl: '',
    customName: '',
    password: '',
    expirationDate: ''
  });

  useEffect(() => {
    fetchUserUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserUrls = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/urls/user-urls');

      // backend may return either response.data.urls or response.data.data
      if (response.data?.success === false) {
        throw new Error(response.data.message || 'Failed to fetch URLs');
      }

      const urlsFromServer = response.data.urls ?? response.data.data ?? response.data;
      setUrls(Array.isArray(urlsFromServer) ? urlsFromServer : []);
    } catch (err) {
      console.error('Fetch URLs error:', err);
      setError('Failed to fetch URLs. Please try again.');
      toast.error(err?.response?.data?.message || err.message || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get backend origin (prefer REACT_APP_BACKEND_URL)
  const getBackendOrigin = () => {
    if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
    try {
      const winOrigin = window.location.origin;
      return winOrigin.includes(':3000') ? winOrigin.replace(':3000', ':5000') : winOrigin;
    } catch (e) {
      return 'http://localhost:5000';
    }
  };

  // Prefer server-provided shortUrl, otherwise construct using backend origin + shortId
  const getShortUrl = (urlObj) => {
    if (!urlObj) return '';
    if (urlObj.shortUrl) return urlObj.shortUrl;
    if (urlObj.shortId) return `${getBackendOrigin()}/s/${urlObj.shortId}`;
    return '';
  };

  const deleteUrl = async (urlId) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      await api.delete(`/urls/${urlId}`);
      setUrls(urls.filter(url => url._id !== urlId));
      toast.success('URL deleted successfully');
    } catch (err) {
      console.error('Delete URL error:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete URL');
    }
  };

  const toggleUrlStatus = async (urlId, currentStatus) => {
    try {
      await api.put(`/urls/${urlId}/status`, {
        isActive: !currentStatus
      });

      setUrls(urls.map(url =>
        url._id === urlId ? { ...url, isActive: !currentStatus } : url
      ));

      toast.success(`URL ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update URL status');
    }
  };

  const handleEdit = (url) => {
    setSelectedUrl(url);
    setEditData({
      destinationUrl: url.destinationUrl,
      customName: url.customName || '',
      password: '',
      expirationDate: url.expirationDate ? new Date(url.expirationDate).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  const updateUrl = async () => {
    try {
      const response = await api.put(`/urls/${selectedUrl._id}`, editData);

      if (response.data?.success === false) {
        throw new Error(response.data.message || 'Failed to update URL');
      }

      const updatedUrl = response.data.url ?? response.data;
      setUrls(urls.map(url =>
        url._id === selectedUrl._id ? updatedUrl : url
      ));
      toast.success('URL updated successfully');
      setShowEditModal(false);
      setSelectedUrl(null);
    } catch (err) {
      console.error('Update URL error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to update URL');
    }
  };

  const handleExport = async (urlId) => {
    try {
      const response = await api.get(`/urls/${urlId}/export`, {
        responseType: 'blob'
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `url-data-${urlId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Data exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err?.response?.data?.message || 'Failed to export data');
    }
  };

  // Helper to download the QR SVG (serializes svg to file)
  const downloadQrSvg = (shortId) => {
    try {
      const svg = document.querySelector('.qr-modal svg');
      if (!svg) {
        toast.error('QR not available for download');
        return;
      }
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${shortId || 'qr'}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR download error:', err);
      toast.error('Failed to download QR');
    }
  };

  if (loading) {
    return <div className="loading">Loading your URLs...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchUserUrls} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="generated-urls">
      <div className="urls-header">
        <h2>All Generated URLs</h2>
        <p className="urls-count">{urls.length} URL{urls.length !== 1 ? 's' : ''} found</p>
      </div>

      {urls.length === 0 ? (
        <div className="no-urls">
          <p>No URLs generated yet. Create your first short URL!</p>
          <Link to="/" className="create-btn">
            <FaLink /> Create New URL
          </Link>
        </div>
      ) : (
        <div className="urls-table-container">
          <table className="urls-table">
            <thead>
              <tr>
                <th>Short URL</th>
                <th>Destination</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map(url => {
                const short = getShortUrl(url);
                return (
                  <tr key={url._id}>
                    <td className="short-url-cell">
                      <div className="short-url-display">
                        <a
                          href={short}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="short-url-link"
                        >
                          {short}
                        </a>
                        <CopyButton
                          text={short}
                          className="small-copy-btn"
                        />
                      </div>
                      {url.customName && (
                        <small className="custom-name">Alias: {url.customName}</small>
                      )}
                    </td>
                    <td className="destination-cell">
                      <div className="destination-url">
                        {url.destinationUrl?.substring(0, 50)}
                        {url.destinationUrl && url.destinationUrl.length > 50 ? '...' : ''}
                      </div>
                    </td>
                    <td className="clicks-cell">
                      <span className="clicks-count">{url.clicks || 0}</span>
                    </td>
                    <td className="date-cell">
                      {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="status-cell">
                      <div className="status-indicators">
                        <span className={`status-badge ${url.isActive ? 'active' : 'inactive'}`}>
                          {url.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {url.password && (
                          <span className="status-badge protected">
                            <FaLock /> Protected
                          </span>
                        )}
                        {url.expirationDate && new Date(url.expirationDate) < new Date() && (
                          <span className="status-badge expired">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="url-actions">
                        <button
                          onClick={() => {
                            setSelectedUrl(url);
                            setShowQRCode(true);
                          }}
                          className="action-btn qr-btn"
                          title="Show QR Code"
                        >
                          <FaQrcode />
                        </button>

                        <Link
                          to={`/analytics?url=${url._id}`}
                          className="action-btn analytics-btn"
                          title="View Analytics"
                        >
                          <FaChartBar />
                        </Link>

                        <CopyButton
                          text={short}
                          className="action-btn copy-btn"
                          title="Copy URL"
                        >
                          <FaCopy />
                        </CopyButton>

                        <button
                          onClick={() => handleEdit(url)}
                          className="action-btn edit-btn"
                          title="Edit URL"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => toggleUrlStatus(url._id, url.isActive)}
                          className={`action-btn status-btn ${url.isActive ? 'deactivate' : 'activate'}`}
                          title={url.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {url.isActive ? <FaUnlock /> : <FaLock />}
                        </button>

                        <button
                          onClick={() => deleteUrl(url._id)}
                          className="action-btn delete-btn"
                          title="Delete URL"
                        >
                          <FaTrash />
                        </button>

                        <button
                          onClick={() => handleExport(url._id)}
                          className="action-btn export-btn"
                          title="Export Data"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && selectedUrl && (
        <div className="modal-overlay">
          <div className="modal qr-modal">
            <div className="modal-header">
              <h3>QR Code for {selectedUrl.customName || selectedUrl.shortId}</h3>
              <button
                onClick={() => {
                  setShowQRCode(false);
                  setSelectedUrl(null);
                }}
                className="close-btn"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="qr-code-container">
                <QRCodeSVG
                  value={getShortUrl(selectedUrl)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="qr-actions">
                <CopyButton
                  text={getShortUrl(selectedUrl)}
                  className="qr-copy-btn"
                >
                  <FaCopy /> Copy URL
                </CopyButton>

                <button
                  onClick={() => downloadQrSvg(selectedUrl.shortId)}
                  className="qr-download-btn"
                >
                  <FaDownload /> Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUrl && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>Edit URL: {selectedUrl.shortId}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUrl(null);
                }}
                className="close-btn"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Destination URL:</label>
                <input
                  type="url"
                  value={editData.destinationUrl}
                  onChange={(e) => setEditData({ ...editData, destinationUrl: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Custom Name:</label>
                <input
                  type="text"
                  value={editData.customName}
                  onChange={(e) => setEditData({ ...editData, customName: e.target.value })}
                  placeholder="Optional custom name"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  placeholder="Set new password (leave empty to keep current)"
                />
              </div>

              <div className="form-group">
                <label>Expiration Date:</label>
                <input
                  type="datetime-local"
                  value={editData.expirationDate}
                  onChange={(e) => setEditData({ ...editData, expirationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUrl(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={updateUrl}
                className="save-btn"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedUrls;

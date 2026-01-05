import React, { useState } from 'react';
import { FaQuestionCircle, FaQrcode, FaLink, FaPaperPlane, FaTimes } from 'react-icons/fa';
import api from '../services/api'; // Use the configured axios instance
import toast from 'react-hot-toast';
import './Footer.css';

const Footer = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    
    if (!helpMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the api instance which has the baseURL configured
      const response = await api.post('/help/message', { message: helpMessage });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Message sent to admin!');
        setHelpMessage('');
        setShowHelp(false);
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Failed to send message';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
    setHelpMessage('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="products-section">
            <h3>Our Products</h3>
            <div className="products-list">
              <div className="product-item">
                <FaLink /> URL Shortener
              </div>
              <div className="product-item">
                <FaQrcode /> QR Code Generator
              </div>
            </div>
          </div>
          
          <div className="help-section">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="help-btn"
              disabled={isSubmitting}
            >
              <FaQuestionCircle /> {isSubmitting ? 'Sending...' : 'Help'}
            </button>
            
            {showHelp && (
              <div className="help-form-container">
                <div className="help-form-header">
                  <h4>Send Message to Admin</h4>
                  <button 
                    onClick={handleCloseHelp}
                    className="close-help-btn"
                    aria-label="Close help form"
                    disabled={isSubmitting}
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleHelpSubmit} className="help-form">
                  <textarea
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    rows="4"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="help-form-actions">
                    <button 
                      type="button" 
                      onClick={handleCloseHelp}
                      className="cancel-btn"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="send-btn"
                      disabled={isSubmitting || !helpMessage.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner"></span> Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane /> Send to Admin
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ShortLink Pro. All rights reserved.</p>
          <p className="footer-contact">
            Need immediate assistance? Email: <a href={`mailto:${process.env.REACT_APP_ADMIN_EMAIL || 'omas7th@gmail.com'}`}>
              {process.env.REACT_APP_ADMIN_EMAIL || 'omas7th@gmail.com'}
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 0 20px;
          margin-top: 60px;
          position: relative;
          z-index: 10;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .products-section h3 {
          margin-bottom: 20px;
          font-size: 1.5rem;
        }
        
        .products-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .product-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: background 0.3s;
        }
        
        .product-item:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .help-section {
          position: relative;
        }
        
        .help-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .help-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        
        .help-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .help-form-container {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          width: 350px;
          z-index: 1000;
          overflow: hidden;
        }
        
        .help-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #667eea;
          color: white;
        }
        
        .help-form-header h4 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .close-help-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .close-help-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .close-help-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .help-form {
          padding: 20px;
        }
        
        .help-form textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          min-height: 120px;
          margin-bottom: 15px;
          transition: border-color 0.3s;
          font-family: inherit;
        }
        
        .help-form textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .help-form textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        
        .help-form-actions {
          display: flex;
          gap: 10px;
        }
        
        .send-btn, .cancel-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .send-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .cancel-btn {
          background: #f1f5f9;
          color: #64748b;
        }
        
        .cancel-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }
        
        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }
        
        .footer-contact {
          margin-top: 10px;
          font-size: 14px;
        }
        
        .footer-contact a {
          color: #a5b4fc;
          text-decoration: none;
        }
        
        .footer-contact a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
          }
          
          .help-form-container {
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            margin: 0;
            width: auto;
            border-radius: 12px 12px 0 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
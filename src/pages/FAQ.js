import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FAQ.css';

const FAQ = () => {
  return (
    <div className="faq-page-wrapper">
      <Header />
      <main className="faq-main-content">
        <h1 className="faq-page-title">Frequently Asked Questions (FAQ)</h1>
        
        <div className="faq-accordion-container">
          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q1</div>
              <h3 className="faq-question-text">Q: Is OmsUrl free?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Yes — core URL shortening with pro features, basic and advance analytics are free. Business features (if any) will be clearly listed in the dashboard.
              </p>
            </div>
          </div>

          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q2</div>
              <h3 className="faq-question-text">Q: Do I need an account to shorten links?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Yes, creating an account unlocks link management, advanced analytics, and pro features.
              </p>
            </div>
          </div>

          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q3</div>
              <h3 className="faq-question-text">Q: What analytics are available?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Click counts, referrers, device/browser breakdowns, locations (derived from IP), hourly/daily distributions,
                and recent click history. We anonymize data where possible to protect user privacy.
              </p>
            </div>
          </div>

          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q4</div>
              <h3 className="faq-question-text">Q: Can I set expiration or password protect a link?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Yes. You can configure expirations and password protection in the link settings.
              </p>
            </div>
          </div>

          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q5</div>
              <h3 className="faq-question-text">Q: How do I report abuse or a malicious link?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Use the contact or report feature in the app, or email <code className="faq-email-code">omslabs1st@gmail.com</code>. 
                We investigate reports promptly.
              </p>
            </div>
          </div>

          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q6</div>
              <h3 className="faq-question-text">Q: Do you provide custom domains?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Yes — OmsUrl supports custom/branded domains. See the settings in the dashboard for instructions on DNS configuration.
              </p>
            </div>
          </div>

          <div className="faq-item">
            <button className="faq-question-header">
              <div className="faq-question-icon">Q7</div>
              <h3 className="faq-question-text">Q: How do I delete a link or my account?</h3>
            </button>
            <div className="faq-answer-content">
              <p className="faq-answer-text">
                A: Use the dashboard to delete individual links. To request account deletion, visit account settings or contact support.
              </p>
            </div>
          </div>
        </div>
        
        {/* Optional info section */}
        <div className="faq-info-section">
          <h3 className="faq-info-title">Still have questions?</h3>
          <p className="faq-info-text">
            Contact our support team at <span className="faq-contact-highlight">omslabs1st@gmail.com</span> for personalized assistance.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
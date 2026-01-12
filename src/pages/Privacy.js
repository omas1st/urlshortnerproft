import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page-wrapper">
      <Header />
      <main className="privacy-main-content">
        <h1 className="privacy-page-title">Privacy Policy</h1>

        <p className="privacy-last-updated">Last updated: January 12, 2026</p>

        <p className="privacy-intro-text">
          OmsUrl (Omslabs) values your privacy. This policy explains what information we collect,
          how we use it, and your choices.
        </p>

        <h2 className="privacy-section-heading">Information We Collect</h2>
        <ul className="privacy-data-list">
          <li className="privacy-data-item">
            <strong>Shortened Link Data:</strong>
            <span className="privacy-data-item-content">original URL, shortId, creation timestamp, click counts.</span>
          </li>
          <li className="privacy-data-item">
            <strong>Click & Analytics Data:</strong>
            <span className="privacy-data-item-content">anonymized visitor metadata such as IP-derived country (if enabled),
              user agent (browser/device), referrer, timestamp and aggregated statistics. We do not log full personal profiles.</span>
          </li>
          <li className="privacy-data-item">
            <strong>Account Data:</strong>
            <span className="privacy-data-item-content">when you create an account we store email and hashed password and any profile details you provide.</span>
          </li>
          <li className="privacy-data-item">
            <strong>Cookies:</strong>
            <span className="privacy-data-item-content">cookies may be used for session management, affiliate tracking (when enabled), and preferences.</span>
          </li>
        </ul>

        <h2 className="privacy-section-heading">How We Use Data</h2>
        <ul className="privacy-use-list">
          <li className="privacy-use-item">Provide and maintain the service (redirects, analytics, account features).</li>
          <li className="privacy-use-item">Generate aggregated analytics and reports for link owners.</li>
          <li className="privacy-use-item">Detect abuse and maintain security.</li>
        </ul>

        <h2 className="privacy-section-heading">Data Sharing & Third Parties</h2>
        <p className="privacy-section-paragraph">
          We do not sell personal data. We may share aggregated, non-identifiable analytics with third-party services
          (e.g. analytics providers) if needed for operations. We may disclose information to comply with legal processes.
        </p>

        <h2 className="privacy-section-heading">Retention</h2>
        <p className="privacy-section-paragraph">
          We retain link and analytics data as described in your account settings and in accordance with our retention
          policy. Users can delete their links and accounts using the dashboard; deleted personal data will be removed
          from primary storage, although backups may persist for a limited period.
        </p>

        <h2 className="privacy-section-heading">Your Choices</h2>
        <ul className="privacy-choices-list">
          <li className="privacy-choices-item">Delete links or your account from the dashboard.</li>
          <li className="privacy-choices-item">Opt out of certain analytics where feasible.</li>
          <li className="privacy-choices-item">Clear cookies or use browser privacy features to limit tracking.</li>
        </ul>

        <h2 className="privacy-section-heading">Contact</h2>
        <p className="privacy-section-paragraph">
          For privacy questions or data requests, contact: <code className="privacy-contact-email">omslabs1st@gmail.com</code>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
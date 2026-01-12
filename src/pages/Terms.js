import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page-container">
      <Header />
      <main className="terms-main-content">
        <h1 className="terms-title-header">Terms of Service</h1>
        <p className="terms-update-date">Last updated: January 12, 2026</p>

        <h2 className="terms-section-heading">Acceptance</h2>
        <p className="terms-paragraph-text">
          By using OmsUrl you agree to these terms. If you do not agree, do not use the service.
        </p>

        <h2 className="terms-section-heading">Use of Service</h2>
        <p className="terms-paragraph-text">
          You are responsible for the content of links you shorten. You agree not to use the service
          to host or distribute illegal, harmful, or infringing content.
        </p>

        <h2 className="terms-section-heading">Prohibited Uses</h2>
        <ul className="terms-prohibited-list">
          <li className="terms-prohibited-item">Malware distribution, phishing, or other illegal activities.</li>
          <li className="terms-prohibited-item">Spam or unsolicited bulk messaging using links from our service.</li>
          <li className="terms-prohibited-item">Any activity that violates the rights of others.</li>
        </ul>

        <h2 className="terms-section-heading">Account Suspension & Abuse</h2>
        <p className="terms-paragraph-text">
          We may suspend or terminate accounts that violate these terms or that are engaged in abusive activity.
        </p>

        <h2 className="terms-section-heading">Intellectual Property</h2>
        <p className="terms-paragraph-text">
          OmsUrl owns the service and its content. You retain ownership of content you submit, except that you grant
          OmsUrl a license to operate and display content as necessary to provide the service.
        </p>

        <h2 className="terms-section-heading">Liability</h2>
        <p className="terms-paragraph-text">
          OmsUrl provides the service "as is". We disclaim liability to the fullest extent permitted by law.
        </p>

        <h2 className="terms-section-heading">Changes</h2>
        <p className="terms-paragraph-text">
          We may update these terms. Continued use after changes indicates acceptance. We will post the last updated date.
        </p>

        <h2 className="terms-section-heading">Contact</h2>
        <p className="terms-paragraph-text">
          For questions about these terms, email: <code className="terms-contact-email">omslabs1st@gmail.com</code>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
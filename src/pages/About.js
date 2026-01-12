import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './About.css';

const About = () => {
  return (
    <div className="about-page-container">
      <Header />
      <main className="about-main-content">
        <div className="about-hero-section">
          <h1 className="about-main-title">About OmsUrl</h1>
          <p className="about-hero-subtitle">
            OmsUrl is a lightweight, privacy-first URL shortening service built by Omslabs.
            Our goal is to give individuals and teams a fast, reliable way to shorten links,
            share them, and measure performance with actionable analytics.
          </p>
        </div>

        <div className="about-section">
          <div className="about-section-icon">
            <div className="about-icon-wrapper">
              <span className="about-icon">🎯</span>
            </div>
            <h2 className="about-section-title">Our Mission</h2>
          </div>
          <div className="about-section-content">
            <p>
              We believe links should be <span className="about-highlight-text">simple, fast, and respectful of user privacy</span>. OmsUrl
              focuses on delivering advanced link features — dynamic rules, geo-targeting,
              QR codes, password protection, and detailed analytics — while keeping the user
              experience friction-free.
            </p>
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-icon">
            <div className="about-icon-wrapper">
              <span className="about-icon">👥</span>
            </div>
            <h2 className="about-section-title">Built By</h2>
          </div>
          <div className="about-section-content">
            <p>
              OmsUrl is developed and maintained by <span className="about-highlight-text">Omslabs</span>. If you'd like to provide feedback,
              report an issue, or request a feature, please use the contact form on the site or
              email us (see the Contact section in the footer).
            </p>
          </div>
        </div>

        <div className="about-section">
          <div className="about-section-icon">
            <div className="about-icon-wrapper">
              <span className="about-icon">🛡️</span>
            </div>
            <h2 className="about-section-title">Trust & Safety</h2>
          </div>
          <div className="about-section-content">
            <p>
              We take abuse seriously. If you find a link that violates our terms, please report it
              via our support channels. We reserve the right to suspend links/accounts that are used
              for abusive or illegal activities.
            </p>
          </div>
        </div>

        {/* Optional Features Grid */}
        <div className="about-features-grid">
          <div className="about-feature-item">
            <span className="about-feature-icon">⚡</span>
            <h3 className="about-feature-title">Lightning Fast</h3>
            <p className="about-feature-desc">Instant URL shortening with sub-second response times</p>
          </div>
          <div className="about-feature-item">
            <span className="about-feature-icon">🔒</span>
            <h3 className="about-feature-title">Privacy First</h3>
            <p className="about-feature-desc">We respect user privacy with anonymized analytics</p>
          </div>
          <div className="about-feature-item">
            <span className="about-feature-icon">📊</span>
            <h3 className="about-feature-title">Advanced Analytics</h3>
            <p className="about-feature-desc">Detailed insights into link performance and audience</p>
          </div>
        </div>

        {/* Optional Contact CTA */}
        <div className="about-contact-cta">
          <h3 className="about-cta-title">Have Questions or Feedback?</h3>
          <p className="about-cta-text">
            We're always looking to improve. Reach out to us through the help button or email us directly.
            Your input helps us build a better service for everyone.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
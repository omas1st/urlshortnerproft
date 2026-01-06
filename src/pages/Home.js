import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UrlShortener from '../components/UrlShortener';
import { useAuth } from '../context/AuthContext';
import { FaRocket, FaShieldAlt, FaChartBar, FaGlobe } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { clearRedirectUrl } = useAuth();

  useEffect(() => {
    clearRedirectUrl();
  }, [clearRedirectUrl]);

  return (
    <div className="home-page">
      <Header />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-title">
              Shorten Links, <span className="highlight">Amplify Results</span>
            </h1>
            <p className="hero-subtitle">
              Advanced URL shortening with analytics, QR codes, and smart features
            </p>
          </div>
        </section>

        {/* URL Shortener Section */}
        <section className="shortener-section">
          <div className="container">
            <UrlShortener />
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Why Choose OmsUrl?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaRocket />
                </div>
                <h3>Smart Dynamic Links</h3>
                <p>Links that adapt based on device, location, time, and user behavior</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaShieldAlt />
                </div>
                <h3>Advanced Security</h3>
                <p>Password protection, expiration dates, and restricted access controls</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaChartBar />
                </div>
                <h3>Detailed Analytics</h3>
                <p>Track clicks, locations, devices, and user engagement in real-time</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaGlobe />
                </div>
                <h3>Global Reach</h3>
                <p>Multiple destinations, geo-targeting, and language-based redirection</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Paste Your URL</h3>
                <p>Enter your long URL in the input field</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Customize Settings</h3>
                <p>Add passwords, expiration, QR codes, and more</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Generate & Share</h3>
                <p>Get your short link and share it anywhere</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Track Performance</h3>
                <p>Monitor analytics and optimize your links</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

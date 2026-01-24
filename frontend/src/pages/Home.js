import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <h1>AI HomeAssist</h1>
          <p className="hero-subtitle">Your Intelligent Home Service Booking Platform</p>
          <p className="hero-description">
            Connect with verified service professionals for all your home service needs. 
            From electrical repairs to plumbing, painting, and more - we've got you covered.
          </p>
          {user && user.role === 'user' && (
            <div className="hero-search">
              <Link to="/user/services" className="btn btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>
                Browse Services →
              </Link>
            </div>
          )}
          {!user && (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose AI HomeAssist?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Matching</h3>
              <p>Our intelligent chatbot helps you find the perfect service provider based on your needs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verified Professionals</h3>
              <p>All service providers are verified and background-checked for your peace of mind</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Ratings & Reviews</h3>
              <p>Read real reviews from other homeowners to make informed decisions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Booking</h3>
              <p>Book services in minutes with our streamlined booking process</p>
            </div>
          </div>
        </div>
      </div>

      {user && user.role === 'user' && (
        <div className="chatbot-section">
          <div className="container">
            <h2>Need Help? Ask Our AI Assistant</h2>
            <Chatbot />
          </div>
        </div>
      )}

      <div className="services-section">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">⚡ Electrical</div>
            <div className="service-card">🔧 Plumbing</div>
            <div className="service-card">🎨 Painting</div>
            <div className="service-card">🪵 Carpentry</div>
            <div className="service-card">❄️ HVAC</div>
            <div className="service-card">🔌 Appliance Repair</div>
            <div className="service-card">🧹 Cleaning</div>
            <div className="service-card">🛠️ Handyman</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

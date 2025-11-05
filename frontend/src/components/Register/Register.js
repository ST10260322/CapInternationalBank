import React from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <div className="register-container">
      <div className="register-disabled-card">
        <div className="lock-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <h1>Self-Registration Disabled</h1>
        
        <p className="main-message">
          For your security and to comply with banking regulations, 
          customer accounts can only be created by our authorized bank employees.
        </p>

        <div className="info-section">
          <h2>How to Open an Account</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Visit a Branch</h3>
                <p>Visit your nearest CAP International Bank branch with your ID document</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Speak to a Representative</h3>
                <p>Our banking representative will assist you with account creation</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Receive Your Credentials</h3>
                <p>You'll receive your account number and temporary password</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Login & Start Banking</h3>
                <p>Use your credentials to access the customer portal immediately</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <h2>Need Assistance?</h2>
          <div className="contact-options">
            <div className="contact-option">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <div>
                <h3>Call Us</h3>
                <p>1-800-CAP-BANK</p>
                <small>(1-800-227-2265)</small>
              </div>
            </div>

            <div className="contact-option">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div>
                <h3>Email Us</h3>
                <p>support@capbank.com</p>
                <small>24/7 Support</small>
              </div>
            </div>

            <div className="contact-option">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <div>
                <h3>Find a Branch</h3>
                <p>Over 500 locations</p>
                <small>Nationwide</small>
              </div>
            </div>
          </div>
        </div>

        <div className="security-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <p>Your security is our priority. All accounts are created with strict verification protocols.</p>
        </div>

        <div className="actions">
          <Link to="/" className="back-to-login-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
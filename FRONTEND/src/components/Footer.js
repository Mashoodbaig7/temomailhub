import React from 'react';
import { Link } from 'react-router-dom';
import './Pages/PagesCss/Footer.css';
import appleLogo from '../components/assets/apple-store.png'; 
import googleLogo from '../components/assets/google-play.png'; 
import gifLogo from '../components/assets/Favicon/logo.gif';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="brand-section">
            <div className="brand-logo">
              <img src={gifLogo} alt="Temp-MailHub Logo" className="logo-image" />
              <h2 className="brand-name">Temp-MailHub</h2>
            </div>
            <p className="brand-description">
            Effortless Temporary Email for Your Privacy & Security. Instantly generate disposable email addresses to keep your inbox spam-free and your personal data secure.
                Our Website Is Develop and Maintained by D-Tech Studios.
            </p>
            <div className="app-badges">
              <Link to="#" className="store-link">
                <img src={appleLogo} alt="App Store" className="store-image" />
              </Link>
              <Link to="#" className="store-link">
                <img src={googleLogo} alt="Google Play" className="store-image" />
              </Link>
            </div>
            <div className="social-links">
              <Link to="#" className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </Link>
              <Link to="#" className="social-icon">
                <i className="fab fa-twitter"></i>
              </Link>
              <Link to="#" className="social-icon">
                <i className="fab fa-linkedin-in"></i>
              </Link>
              <Link to="#" className="social-icon">
                <i className="fab fa-instagram"></i>
              </Link>
            </div>
          </div>

         
          <div className="footer-column">
              <h5 className="nav-title">About Us</h5>
              <ul className="nav-list">
                <li><Link to="/" className="nav-link">Home</Link></li>
                <li><Link to="/about" className="nav-link">About</Link></li>
                <li><Link to="/contact" className="nav-link">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h5 className="nav-title">Legal Information</h5>
              <ul className="nav-list">
                <li><Link to="/privacy" className="nav-link">Privacy Policy</Link></li>
                <li><Link to="/terms" className="nav-link">Terms of Service</Link></li>
                <li><Link to="/content" className="nav-link">Content Policy</Link></li>
                <li><Link to="/disclaimer" className="nav-link">Disclaimer</Link></li>
              </ul>
            </div>
          </div>

        <div className="copyright-section">
          <p className="copyright-text">
            © {new Date().getFullYear()} Temp-MailHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';
import './PagesCss/UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose, feature = 'Custom Domains' }) => {
  if (!isOpen) return null;

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>
        
        <div className="upgrade-modal-content">
          <div className="upgrade-icon">
            <i className="fa-solid fa-crown"></i>
          </div>
          
          <h2 className="upgrade-title">Premium Feature</h2>
          
          <p className="upgrade-description">
            <strong>{feature}</strong> is available exclusively for Premium subscribers.
            Upgrade your plan to unlock this feature and many more!
          </p>

          <div className="feature-benefits">
            <h3>Premium Plan Includes:</h3>
            <div className="benefits-grid">
              <div className="benefit">
                <i className="fa-solid fa-check-circle"></i>
                <span>Custom Private Domains</span>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-check-circle"></i>
                <span>Unlimited Emails</span>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-check-circle"></i>
                <span>Extended Email Storage</span>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-check-circle"></i>
                <span>Priority Support</span>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-check-circle"></i>
                <span>Ad-Free Experience</span>
              </div>
              <div className="benefit">
                <i className="fa-solid fa-check-circle"></i>
                <span>Advanced Spam Filters</span>
              </div>
            </div>
          </div>

          <div className="pricing-preview">
            <div className="price-tag">
              <span className="currency">$</span>
              <span className="amount">9.99</span>
              <span className="period">/month</span>
            </div>
            <p className="price-note">or save 20% with annual billing</p>
          </div>

          <div className="modal-actions">
            <Link to="/pricing" className="btn-upgrade-primary">
              <i className="fa-solid fa-crown"></i>
              Upgrade to Premium
            </Link>
            <button onClick={onClose} className="btn-upgrade-secondary">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

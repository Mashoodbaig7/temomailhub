import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Pages/PagesCss/RateLimitModal.css';

const RateLimitModal = ({
  isOpen,
  onClose,
  rateLimitData,
  userPlan
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!isOpen || !rateLimitData?.resetTime) return;

    const updateTimer = () => {
      const now = new Date();
      const reset = new Date(rateLimitData.resetTime);
      const diff = reset - now;

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isOpen, rateLimitData]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (rateLimitData?.requiresAuth) {
      return (
        <>
          <div className="modal-icon limit-icon">
            <i className="fa-solid fa-user-lock"></i>
          </div>
          <h2 className="modal-title">Create an account to continue</h2>
          <p className="modal-description">
            You've reached your limit of <strong>2 emails</strong> as an anonymous user.
            Create a free account to generate up to <strong>5 active emails</strong> at once!
          </p>
          <div className="benefits-list">
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>5 active emails (Free Plan)</span>
            </div>
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>10 active emails (Standard Plan)</span>
            </div>
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>15 active emails (Premium Plan)</span>
            </div>
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>Track your email history</span>
            </div>
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>Custom email names</span>
            </div>
          </div>
          <div className="modal-actions">
            <Link to="/sign" className="btn-primary">
              <i className="fa-solid fa-user-plus"></i>
              Create Free Account
            </Link>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </>
      );
    } else if (rateLimitData?.requiresUpgrade) {
      // For Premium users (no next tier available)
      if (userPlan === 'Premium' || !rateLimitData.nextTier) {
        return (
          <>
            <div className="modal-icon upgrade-icon">
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <h2 className="modal-title">Active email limit reached</h2>
            <p className="modal-description">
              You've reached your limit of <strong>{rateLimitData.currentLimit} active emails</strong> on your {userPlan} plan.
              Wait for existing emails to expire, or they will automatically expire in:
            </p>

            {timeRemaining && (
              <div className="timer-box">
                <div className="timer-label">Oldest email expires in</div>
                <div className="timer-display">{timeRemaining}</div>
              </div>
            )}

            <div className="premium-info">
              <i className="fa-solid fa-crown"></i>
              <p>You're on the highest plan with maximum email generation capacity.</p>
            </div>

            <div className="modal-actions">
              <button onClick={onClose} className="btn-secondary">
                <i className="fa-solid fa-clock"></i>
                Wait for Expiry
              </button>
            </div>
          </>
        );
      }

      // For Free and Standard users (show upgrade options)
      return (
        <>
          <div className="modal-icon upgrade-icon">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <h2 className="modal-title">Upgrade your plan for more emails</h2>
          <p className="modal-description">
            You've reached your limit of <strong>{rateLimitData.currentLimit} active emails</strong> on your {userPlan} plan.
            Oldest email will expire in:
          </p>

          {timeRemaining && (
            <div className="timer-box">
              <div className="timer-label">Time until expiry</div>
              <div className="timer-display">{timeRemaining}</div>
            </div>
          )}

          <div className="modal-options">
            <div className="option-divider">
              <span>OR</span>
            </div>
            <div className="upgrade-section">
              <h3>Upgrade Your Plan</h3>
              <p>Get more active emails with a premium plan</p>
              <div className="plans-comparison">
                {userPlan === 'Free' && (
                  <>
                    <div className="plan-card">
                      <div className="plan-name">Standard</div>
                      <div className="plan-limit">10 active emails</div>
                    </div>
                    <div className="plan-card highlight">
                      <div className="plan-name">Premium</div>
                      <div className="plan-limit">15 active emails</div>
                      <div className="plan-badge">Best Value</div>
                    </div>
                  </>
                )}
                {userPlan === 'Standard' && (
                  <div className="plan-card highlight">
                    <div className="plan-name">Premium</div>
                    <div className="plan-limit">15 active emails</div>
                    <div className="plan-badge">Maximum Emails</div>
                  </div>
                )}
              </div>
              <Link to="/pricing" className="btn-primary">
                <i className="fa-solid fa-crown"></i>
                View Pricing Plans
              </Link>
            </div>
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-secondary">
              <i className="fa-solid fa-clock"></i>
              Wait for Expiry
            </button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="rate-limit-modal-overlay" onClick={onClose}>
      <div className="rate-limit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default RateLimitModal;

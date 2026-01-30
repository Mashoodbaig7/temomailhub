import React, { useState, useEffect } from 'react';
import './PagesCss/LegalInformation.css';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const [isReading, setIsReading] = useState(false);
  const [acceptAll, setAcceptAll] = useState(false);
  const [sections, setSections] = useState({
    acceptance: false,
    usage: false,
    account: false,
    payments: false,
    intellectual: false,
    liability: false
  });

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
      setIsReading(scrollPercentage > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionToggle = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAcceptAll = () => {
    const newValue = !acceptAll;
    setAcceptAll(newValue);
    setSections({
      acceptance: newValue,
      usage: newValue,
      account: newValue,
      payments: newValue,
      intellectual: newValue,
      liability: newValue
    });
  };

  const handleAccept = () => {
    if (Object.values(sections).every(value => value)) {
      alert('Thank you for accepting our Terms of Service!');
      // In a real app, you would save this to user preferences or state
    } else {
      alert('Please read and accept all sections of the Terms of Service.');
    }
  };

  return (
    <div className="legal-page">
      {/* Progress Indicator */}
      {isReading && (
        <div className="reading-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Object.values(sections).filter(Boolean).length / Object.keys(sections).length * 100}%` 
              }}
            ></div>
          </div>
          <span className="progress-text">
            {Math.round((Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100)}% Read
          </span>
        </div>
      )}

      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <div className="header-content">
            <h1 className="legal-title">
              <i className="fa-solid fa-file-contract"></i>
              Terms of Service
            </h1>
            <div className="header-meta">
              <div className="meta-item">
                <i className="fa-solid fa-calendar"></i>
                <div>
                  <span>Effective Date</span>
                  <strong>January 04, 2025</strong>
                </div>
              </div>
              <div className="meta-item">
                <i className="fa-solid fa-clock"></i>
                <div>
                  <span>Last Updated</span>
                  <strong>January 04, 2025</strong>
                </div>
              </div>
              <div className="meta-item">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <div>
                  <span>Reading Time</span>
                  <strong>~5 minutes</strong>
                </div>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-print" onClick={() => window.print()}>
              <i className="fa-solid fa-print"></i>
              Print Terms
            </button>
            
          </div>
        </div>

        {/* Introduction */}
        <div className="legal-intro">
          <div className="intro-content">
            <h2>Welcome to Temp-MailHub</h2>
            
            <p>
              These Terms of Service ("Terms") govern your access to and use of Temp-MailHub.com, 
              a temporary email service developed by <strong>D-Tech Studios</strong>. By accessing 
              or using our service, you agree to be bound by these Terms.
            </p>
            
          </div>
        </div>

        {/* Table of Contents */}
        <div className="toc-container">
          <h3><i className="fa-solid fa-list"></i> Table of Contents</h3>
          <nav className="toc-nav">
            <Link to="#acceptance" className="toc-link">
              <i className="fa-solid fa-check-circle"></i>
              <span>1. Acceptance of Terms</span>
            </Link>
            <Link to="#usage" className="toc-link">
              <i className="fa-solid fa-envelope"></i>
              <span>2. Use of Service</span>
            </Link>
            <Link to="#account" className="toc-link">
              <i className="fa-solid fa-user-shield"></i>
              <span>3. Account Responsibilities</span>
            </Link>
            <Link to="#subscriptions" className="toc-link">
              <i className="fa-solid fa-credit-card"></i>
              <span>4. Subscriptions & Payments</span>
            </Link>
            <Link to="#intellectual" className="toc-link">
              <i className="fa-solid fa-copyright"></i>
              <span>5. Intellectual Property</span>
            </Link>
            <Link to="#liability" className="toc-link">
              <i className="fa-solid fa-scale-balanced"></i>
              <span>6. Disclaimer & Liability</span>
            </Link>
            <Link to="#governing" className="toc-link">
              <i className="fa-solid fa-gavel"></i>
              <span>7. Governing Law</span>
            </Link>
            <Link to="#changes" className="toc-link">
              <i className="fa-solid fa-pen-to-square"></i>
              <span>8. Changes to Terms</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="legal-content">
          {/* Section 1 */}
          <section id="acceptance" className="legal-section">
            <div className="section-header">
              <div className="section-number">1</div>
              <h3>Acceptance of Terms</h3>
              <label className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections.acceptance}
                  onChange={() => handleSectionToggle('acceptance')}
                />
                <span>I have read and understood this section</span>
              </label>
            </div>
            <div className="section-content">
              <p>
                By accessing or using Temp-MailHub.com, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service. If you do not agree to these Terms, 
                you must immediately cease using our services.
              </p>
              <div className="notice-box">
                <i className="fa-solid fa-lightbulb"></i>
                <p>
                  <strong>Note:</strong> These Terms constitute a legally binding agreement between you 
                  and D-Tech Studios. Continued use of the service constitutes ongoing acceptance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="usage" className="legal-section">
            <div className="section-header">
              <div className="section-number">2</div>
              <h3>Use of the Service</h3>
              <label className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections.usage}
                  onChange={() => handleSectionToggle('usage')}
                />
                <span>I have read and understood this section</span>
              </label>
            </div>
            <div className="section-content">
              <p>
                Temp-MailHub provides temporary email services designed for privacy, security, 
                and convenience. You agree to use the service only for lawful purposes and in 
                accordance with these Terms.
              </p>
              
              <h4>Permitted Use</h4>
              <ul className="check-list">
                <li><i className="fa-solid fa-check"></i> Privacy protection for online registrations</li>
                <li><i className="fa-solid fa-check"></i> Temporary communication needs</li>
                <li><i className="fa-solid fa-check"></i> Testing and development purposes</li>
              </ul>

              <h4>Prohibited Activities</h4>
              <div className="warning-box">
                <i className="fa-solid fa-ban"></i>
                <div>
                  <p>You agree <strong>not</strong> to use the service for:</p>
                  <ul className="warning-list">
                    <li>Illegal activities or content distribution</li>
                    <li>Spam, phishing, or fraudulent activities</li>
                    <li>Harassment, threats, or hate speech</li>
                    <li>Bypassing security features or disrupting services</li>
                    <li>Commercial spamming or bulk emailing</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="account" className="legal-section">
            <div className="section-header">
              <div className="section-number">3</div>
              <h3>Account Responsibilities</h3>
              <label className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections.account}
                  onChange={() => handleSectionToggle('account')}
                />
                <span>I have read and understood this section</span>
              </label>
            </div>
            <div className="section-content">
              <p>
                Temp-MailHub is designed as a temporary, anonymous email service. 
                You understand and agree to the following responsibilities:
              </p>
              
              <div className="feature-cards">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fa-solid fa-user-lock"></i>
                  </div>
                  <div className="feature-content">
                    <h5>Anonymity & Privacy</h5>
                    <p>Accounts are designed for temporary use. No personal information is required for free accounts.</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div className="feature-content">
                    <h5>User Responsibility</h5>
                    <p>You are solely responsible for all activities conducted through your temporary email accounts.</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div className="feature-content">
                    <h5>Data Retention</h5>
                    <p>Emails are automatically deleted based on your plan duration. We do not guarantee permanent storage.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="subscriptions" className="legal-section">
            <div className="section-header">
              <div className="section-number">4</div>
              <h3>Subscriptions & Payments</h3>
              <label className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections.payments}
                  onChange={() => handleSectionToggle('payments')}
                />
                <span>I have read and understood this section</span>
              </label>
            </div>
            <div className="section-content">
              <p>
                Temp-MailHub offers both free and premium subscription plans. 
                By subscribing to a paid plan, you agree to the following terms:
              </p>
              
              <div className="terms-grid">
                <div className="term-item">
                  <div className="term-icon">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <h5>Payment Processing</h5>
                  <p>All payments are processed through secure third-party providers. We do not store your payment information.</p>
                </div>
                
                <div className="term-item">
                  <div className="term-icon">
                    <i className="fa-solid fa-sync"></i>
                  </div>
                  <h5>Auto-Renewal</h5>
                  <p>Subscriptions automatically renew at the end of each billing period unless canceled before renewal.</p>
                </div>
                
                <div className="term-item">
                  <div className="term-icon">
                    <i className="fa-solid fa-hand-holding-usd"></i>
                  </div>
                  <h5>Refund Policy</h5>
                  <p>Refunds are available within 15 days of purchase, subject to our refund policy conditions.</p>
                </div>
              </div>
              
              <div className="notice-box">
                <i className="fa-solid fa-info-circle"></i>
                <p>
                  <strong>Important:</strong> Subscription fees are non-transferable. 
                  You can manage or cancel your subscription at any time from your account settings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="intellectual" className="legal-section">
            <div className="section-header">
              <div className="section-number">5</div>
              <h3>Intellectual Property</h3>
              <label className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections.intellectual}
                  onChange={() => handleSectionToggle('intellectual')}
                />
                <span>I have read and understood this section</span>
              </label>
            </div>
            <div className="section-content">
              <p>
                All intellectual property rights in and to Temp-MailHub, including but not limited to 
                trademarks, logos, service marks, graphics, software, and content, are owned by D-Tech Studios.
              </p>
              
              <div className="ip-rules">
                <div className="rule-box allowed">
                  <i className="fa-solid fa-check-circle"></i>
                  <div>
                    <h5>Allowed</h5>
                    <ul>
                      <li>Personal use of the service</li>
                      <li>Sharing referral links</li>
                      <li>Fair use of publicly available information</li>
                    </ul>
                  </div>
                </div>
                
                <div className="rule-box prohibited">
                  <i className="fa-solid fa-times-circle"></i>
                  <div>
                    <h5>Prohibited</h5>
                    <ul>
                      <li>Copying or modifying our code</li>
                      <li>Using our branding without permission</li>
                      <li>Reverse engineering the service</li>
                      <li>Creating derivative works</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="liability" className="legal-section">
            <div className="section-header">
              <div className="section-number">6</div>
              <h3>Disclaimer & Liability</h3>
              <label className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections.liability}
                  onChange={() => handleSectionToggle('liability')}
                />
                <span>I have read and understood this section</span>
              </label>
            </div>
            <div className="section-content">
              <div className="warning-box important">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <div>
                  <h5>Important Disclaimer</h5>
                  <p>
                    Temp-MailHub is provided on an "AS IS" and "AS AVAILABLE" basis. 
                    D-Tech Studios makes no warranties, expressed or implied, regarding the service.
                  </p>
                </div>
              </div>
              
              <h4>Limitation of Liability</h4>
              <ul className="liability-list">
                <li>
                  <i className="fa-solid fa-envelope-circle-check"></i>
                  <div>
                    <strong>Email Delivery:</strong> We do not guarantee delivery or receipt of emails.
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-database"></i>
                  <div>
                    <strong>Data Loss:</strong> We are not responsible for any data loss or email deletion.
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-shield-halved"></i>
                  <div>
                    <strong>Security:</strong> While we implement security measures, we cannot guarantee absolute security.
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-handcuffs"></i>
                  <div>
                    <strong>Legal Use:</strong> You are responsible for ensuring your use complies with all applicable laws.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="governing" className="legal-section">
            <div className="section-header">
              <div className="section-number">7</div>
              <h3>Governing Law</h3>
            </div>
            <div className="section-content">
              <p>
                These Terms and any separate agreements whereby we provide you services shall be 
                governed by and construed in accordance with the laws of the State of Texas, 
                United States, without regard to its conflict of law principles.
              </p>
              
              <div className="jurisdiction-info">
                <div className="jurisdiction-card">
                  <div className="jurisdiction-flag">
                    <i className="fa-solid fa-flag-usa"></i>
                  </div>
                  <div>
                    <h5>Jurisdiction</h5>
                    <p>State of Texas, United States</p>
                  </div>
                </div>
                
                <div className="jurisdiction-card">
                  <div className="jurisdiction-flag">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <div>
                    <h5>Dispute Resolution</h5>
                    <p>Any disputes shall be resolved in Texas courts</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="changes" className="legal-section">
            <div className="section-header">
              <div className="section-number">8</div>
              <h3>Changes to Terms</h3>
            </div>
            <div className="section-content">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of 
                significant changes through email or in-app notifications. Continued use of the 
                service after changes constitutes acceptance of the new Terms.
              </p>
              
              <div className="update-notice">
                <i className="fa-solid fa-bell"></i>
                <div>
                  <h5>Update Notification</h5>
                  <p>
                    It is your responsibility to review these Terms periodically. 
                    We recommend checking this page regularly for updates.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="legal-section contact-section">
            <div className="section-header">
              <div className="section-number">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <h3>Contact Information</h3>
            </div>
            <div className="section-content">
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fa-solid fa-building"></i>
                  <div>
                    <h5>Company</h5>
                    <p>D-Tech Studios</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className="fa-solid fa-envelope"></i>
                  <div>
                    <h5>Support Email</h5>
                    <p>support@temp-mailhub.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className="fa-solid fa-copyright"></i>
                  <div>
                    <h5>Copyright</h5>
                    <p>© 2025 D-Tech Studios. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptance Section */}
          <div className="acceptance-section">
            <div className="acceptance-header">
              <h3><i className="fa-solid fa-file-signature"></i> Terms Acceptance</h3>
              <p>Please confirm that you have read and understood our Terms of Service</p>
            </div>
            
            <div className="acceptance-actions">
              <div className="accept-all">
                <label className="accept-all-checkbox">
                  <input
                    type="checkbox"
                    checked={acceptAll}
                    onChange={handleAcceptAll}
                  />
                  <div className="checkbox-label">
                    <i className="fa-solid fa-check-double"></i>
                    <span>
                      <strong>I accept all Terms & Conditions</strong><br/>
                      <small>By checking this box, you agree to all sections above</small>
                    </span>
                  </div>
                </label>
              </div>
              
              <div className="accept-buttons">
                <button className="btn btn-outline">
                  <i className="fa-solid fa-xmark"></i>
                  Decline
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAccept}
                  disabled={!Object.values(sections).every(value => value)}
                >
                  <i className="fa-solid fa-check"></i>
                  Accept Terms
                </button>
              </div>
            </div>
            
            <div className="acceptance-footer">
              <p>
                <i className="fa-solid fa-lock"></i>
                Your acceptance is securely recorded. You can review these terms anytime in your account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
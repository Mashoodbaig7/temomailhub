import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PagesCss/LegalInformation.css';

const PrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [dataPreferences, setDataPreferences] = useState({
    analytics: true,
    advertising: false,
    personalization: true
  });
  const [consentGiven, setConsentGiven] = useState(false);

  // Initialize all sections as expanded
  useEffect(() => {
    const sections = [
      'information', 'usage', 'sharing', 'retention',
      'security', 'choices', 'children', 'changes', 'contact'
    ];
    const initialExpanded = {};
    sections.forEach(section => {
      initialExpanded[section] = true;
    });
    setExpandedSections(initialExpanded);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAllSections = () => {
    const allExpanded = Object.values(expandedSections).every(value => value);
    const newState = {};
    Object.keys(expandedSections).forEach(key => {
      newState[key] = !allExpanded;
    });
    setExpandedSections(newState);
  };

  const handlePreferenceChange = (preference) => {
    setDataPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleConsent = () => {
    if (!consentGiven) {
      setConsentGiven(true);
      alert('Thank you for acknowledging our Privacy Policy. Your preferences have been saved.');
      // In real app, save preferences to backend
    }
  };

  const sections = [
    {
      id: 'information',
      title: 'Information We Collect',
      icon: 'fa-solid fa-database',
      content: () => (
        <>
          <p className="privacy-paragraph">
            We collect various types of information to provide and improve our services, 
            including temporary email generation and user authentication.
          </p>
          
          <div className="data-categories">
            <div className="data-category">
              <div className="category-header">
                <i className="fa-solid fa-user-circle"></i>
                <h4>Personal Information</h4>
              </div>
              <p>Information you provide during account creation, such as your name, email address, and login credentials (via Facebook, Google, or Apple).</p>
            </div>
            
            <div className="data-category">
              <div className="category-header">
                <i className="fa-solid fa-envelope"></i>
                <h4>Temporary Email Data</h4>
              </div>
              <p>We generate temporary email addresses for your use. Messages received are stored temporarily and deleted after a set duration.</p>
            </div>
            
            <div className="data-category">
              <div className="category-header">
                <i className="fa-solid fa-mobile-screen"></i>
                <h4>Device Information</h4>
              </div>
              <p>We may collect device-related data such as operating system, browser type, and IP address for security and optimization.</p>
            </div>
            
            <div className="data-category">
              <div className="category-header">
                <i className="fa-solid fa-chart-line"></i>
                <h4>Usage Data</h4>
              </div>
              <p>Information regarding how you interact with Temp-MailHub, including features used and time spent on the platform.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: 'fa-solid fa-cogs',
      content: () => (
        <>
          <p className="privacy-paragraph">
            Your information helps us provide, improve, and secure Temp-MailHub services.
          </p>
          
          <div className="usage-grid">
            <div className="usage-item">
              <div className="usage-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <div className="usage-content">
                <h5>Service Delivery</h5>
                <p>Provide and improve Temp-MailHub's services and features</p>
              </div>
            </div>
            
            <div className="usage-item">
              <div className="usage-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="usage-content">
                <h5>Authentication</h5>
                <p>Secure your login using Facebook, Google, or Apple authentication</p>
              </div>
            </div>
            
            <div className="usage-item">
              <div className="usage-icon">
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div className="usage-content">
                <h5>User Experience</h5>
                <p>Ensure a smooth and personalized user experience</p>
              </div>
            </div>
            
            <div className="usage-item">
              <div className="usage-icon">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div className="usage-content">
                <h5>Security</h5>
                <p>Maintain platform security and prevent abuse</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'sharing',
      title: 'Sharing Your Information',
      icon: 'fa-solid fa-share-nodes',
      content: () => (
        <>
          <div className="privacy-notice">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              <strong>We do not sell your personal data.</strong> We only share information when necessary 
              for service provision, legal compliance, or with your consent.
            </p>
          </div>
          
          <div className="sharing-partners">
            <div className="partner-card">
              <div className="partner-icon">
                <i className="fa-solid fa-server"></i>
              </div>
              <div className="partner-content">
                <h5>Service Providers</h5>
                <p>To facilitate platform operations and maintenance</p>
                <span className="partner-tag">Necessary</span>
              </div>
            </div>
            
            <div className="partner-card">
              <div className="partner-icon">
                <i className="fa-solid fa-gavel"></i>
              </div>
              <div className="partner-content">
                <h5>Legal Authorities</h5>
                <p>When required by law or to enforce platform policies</p>
                <span className="partner-tag">Legal Requirement</span>
              </div>
            </div>
            
            <div className="partner-card">
              <div className="partner-icon">
                <i className="fa-solid fa-rectangle-ad"></i>
              </div>
              <div className="partner-content">
                <h5>Advertising Networks</h5>
                <p>For displaying relevant ads via third-party providers</p>
                <span className="partner-tag optional">Optional</span>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: 'fa-solid fa-clock-rotate-left',
      content: () => (
        <>
          <p className="privacy-paragraph">
            We retain your data only as long as necessary for the purposes outlined in this policy.
          </p>
          
          <div className="retention-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h5>Temporary Emails</h5>
                <p>Deleted automatically after a short duration (10 minutes to 24 hours based on your plan)</p>
                <div className="timeline-badge short">Short-term</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h5>Account Data</h5>
                <p>Retained while your account is active, deleted upon account closure</p>
                <div className="timeline-badge medium">Medium-term</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h5>Device & Usage Data</h5>
                <p>Retained for analytics and security purposes for up to 90 days</p>
                <div className="timeline-badge long">Long-term</div>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'security',
      title: 'Security Measures',
      icon: 'fa-solid fa-shield',
      content: () => (
        <>
          <div className="security-warning">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <p>
              <strong>Important:</strong> While we implement robust security measures to safeguard your data, 
              no system can guarantee absolute security. We recommend practicing good security habits.
            </p>
          </div>
          
          <div className="security-features">
            <div className="feature-item">
              <i className="fa-solid fa-lock"></i>
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-server"></i>
              <span>Secure Data Centers</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-user-shield"></i>
              <span>Regular Security Audits</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-key"></i>
              <span>Encrypted Authentication</span>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'choices',
      title: 'Your Privacy Choices',
      icon: 'fa-solid fa-sliders',
      content: () => (
        <>
          <p className="privacy-paragraph">
            You have control over your data and privacy settings.
          </p>
          
          <div className="privacy-controls">
            <div className="control-item">
              <div className="control-header">
                <i className="fa-solid fa-eye"></i>
                <h5>Data Access</h5>
              </div>
              <p>Review your usage data and personal information within the app</p>
              <button className="control-action">
                <i className="fa-solid fa-download"></i>
                Request Data
              </button>
            </div>
            
            <div className="control-item">
              <div className="control-header">
                <i className="fa-solid fa-trash"></i>
                <h5>Account Deletion</h5>
              </div>
              <p>Delete your account and associated data at any time</p>
              <button className="control-action delete">
                <i className="fa-solid fa-user-slash"></i>
                Delete Account
              </button>
            </div>
            
            <div className="control-item">
              <div className="control-header">
                <i className="fa-solid fa-bell-slash"></i>
                <h5>Opt-Out Options</h5>
              </div>
              <p>Manage your preferences for ads and communications</p>
              <div className="opt-out-options">
                <button className="opt-out-btn">
                  <i className="fa-solid fa-envelope"></i>
                  Email
                </button>
                <button className="opt-out-btn">
                  <i className="fa-solid fa-mobile-screen"></i>
                  Push
                </button>
                <button className="opt-out-btn">
                  <i className="fa-solid fa-ad"></i>
                  Ads
                </button>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'children',
      title: "Children's Privacy",
      icon: 'fa-solid fa-child',
      content: () => (
        <div className="children-policy">
          <div className="age-restriction">
            <i className="fa-solid fa-13"></i>
            <div>
              <h5>Age Restriction</h5>
              <p>Temp-MailHub is not intended for children under 13 years of age.</p>
            </div>
          </div>
          
          <div className="compliance-note">
            <i className="fa-solid fa-check-circle"></i>
            <p>
              We do not knowingly collect personal information from children under 13. 
              If we learn that we have collected such information, we will delete it immediately.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'changes',
      title: 'Policy Updates',
      icon: 'fa-solid fa-code-pull-request',
      content: () => (
        <>
          <div className="update-process">
            <div className="update-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h5>Review & Update</h5>
                <p>We periodically review and update our privacy policy</p>
              </div>
            </div>
            
            <div className="update-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h5>Notification</h5>
                <p>Users are notified of significant changes via email or in-app notification</p>
              </div>
            </div>
            
            <div className="update-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h5>Acceptance</h5>
                <p>Continued use after changes means acceptance of the revised policy</p>
              </div>
            </div>
          </div>
          
          <div className="update-history">
            <h5>Recent Updates:</h5>
            <ul className="update-list">
              <li>
                <span className="update-date">Jan 04, 2025</span>
                <span className="update-desc">Initial Privacy Policy Release</span>
              </li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: 'fa-solid fa-headset',
      content: () => (
        <div className="contact-details">
          <div className="contact-card">
            <div className="contact-icon">
              <i className="fa-solid fa-building"></i>
            </div>
            <div className="contact-info">
              <h5>Company</h5>
              <p>D-Tech Studios</p>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="contact-info">
              <h5>Support Email</h5>
              <Link to="mailto:support@temp-mailhub.com">support@temp-mailhub.com</Link>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="contact-info">
              <h5>Response Time</h5>
              <p>Within 24-48 hours</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        {/* Header */}
        <div className="privacy-header">
          <div className="header-content">
            <h1 className="privacy-title">
              <i className="fa-solid fa-shield-halved"></i>
              Privacy Policy
            </h1>
            <p className="privacy-subtitle">
              Protecting your privacy is our priority. This policy explains how we collect, 
              use, and protect your information.
            </p>
          </div>
          
          <div className="header-meta">
            <div className="meta-info">
              <i className="fa-solid fa-calendar-check"></i>
              <div>
                <span>Effective Date</span>
                <strong>January 04, 2025</strong>
              </div>
            </div>
            <div className="meta-info">
              <i className="fa-solid fa-clock"></i>
              <div>
                <span>Last Updated</span>
                <strong>January 04, 2025</strong>
              </div>
            </div>
            <button className="toggle-all-btn" onClick={toggleAllSections}>
              <i className="fa-solid fa-arrows-up-down"></i>
              {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Data Preferences */}
        <div className="preferences-section">
          <h3><i className="fa-solid fa-sliders"></i> Your Privacy Preferences</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={dataPreferences.analytics}
                  onChange={() => handlePreferenceChange('analytics')}
                />
                <div className="preference-content">
                  <i className="fa-solid fa-chart-pie"></i>
                  <div>
                    <h5>Analytics</h5>
                    <p>Help us improve our services</p>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={dataPreferences.advertising}
                  onChange={() => handlePreferenceChange('advertising')}
                />
                <div className="preference-content">
                  <i className="fa-solid fa-ad"></i>
                  <div>
                    <h5>Advertising</h5>
                    <p>Personalized ads and offers</p>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={dataPreferences.personalization}
                  onChange={() => handlePreferenceChange('personalization')}
                />
                <div className="preference-content">
                  <i className="fa-solid fa-user-cog"></i>
                  <div>
                    <h5>Personalization</h5>
                    <p>Customized experience</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="policy-sections">
          {sections.map((section) => (
            <div key={section.id} className={`policy-section ${expandedSections[section.id] ? 'expanded' : 'collapsed'}`}>
              <div 
                className="section-header"
                onClick={() => toggleSection(section.id)}
              >
                <div className="section-title">
                  <i className={section.icon}></i>
                  <h3>{section.title}</h3>
                </div>
                <button className="section-toggle">
                  <i className={`fa-solid fa-chevron-${expandedSections[section.id] ? 'up' : 'down'}`}></i>
                </button>
              </div>
              
              <div className="section-content">
                <section.content />
              </div>
            </div>
          ))}
        </div>

        {/* Consent Section */}
        <div className="consent-section">
          <div className="consent-content">
            <div className="consent-header">
              <i className="fa-solid fa-file-signature"></i>
              <div>
                <h3>Policy Acknowledgment</h3>
                <p>By continuing to use Temp-MailHub, you acknowledge that you have read and understood this Privacy Policy.</p>
              </div>
            </div>
            
            <div className="consent-actions">
              <button 
                className={`consent-btn ${consentGiven ? 'consented' : ''}`}
                onClick={handleConsent}
              >
                {consentGiven ? (
                  <>
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Acknowledged</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-thumbs-up"></i>
                    <span>Acknowledge Policy</span>
                  </>
                )}
              </button>
              
              <button className="consent-print" onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i>
                Print Policy
              </button>
            </div>
            
            <div className="consent-footer">
              <p>
                <i className="fa-solid fa-copyright"></i>
                D-Tech Studios © 2025. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Make sure this export statement is present
export default PrivacyPolicy;
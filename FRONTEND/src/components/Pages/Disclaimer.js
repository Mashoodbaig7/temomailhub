import React, { useState, useEffect } from 'react';
import './PagesCss/LegalInformation.css';

const Disclaimer = () => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Initialize sections as expanded
  useEffect(() => {
    const sections = [
      'temporary', 'accuracy', 'risk', 'prohibited', 
      'external', 'changes', 'contact'
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

  const handleAcknowledge = () => {
    if (!acknowledged) {
      setAcknowledged(true);
      // In a real app, you might want to save this to localStorage or backend
      localStorage.setItem('disclaimerAcknowledged', 'true');
    }
  };

  const handleRiskAccept = () => {
    if (!riskAccepted) {
      setRiskAccepted(true);
      // In a real app, you might want to save this to localStorage or backend
      localStorage.setItem('riskAccepted', 'true');
    }
  };

  const sections = [
    {
      id: 'temporary',
      title: 'Temporary Nature of Emails',
      icon: 'fa-solid fa-clock',
      severity: 'high',
      content: () => (
        <>
          <div className="warning-box severe">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
              <h4>Important Notice</h4>
              <p>Temp-MailHub provides disposable email addresses designed exclusively for temporary use.</p>
            </div>
          </div>
          
          <div className="feature-list">
            <div className="feature-item negative">
              <i className="fa-solid fa-trash-can"></i>
              <div>
                <h5>Automatic Deletion</h5>
                <p>Emails are automatically deleted based on your plan duration</p>
              </div>
            </div>
            
            <div className="feature-item negative">
              <i className="fa-solid fa-database"></i>
              <div>
                <h5>No Guaranteed Storage</h5>
                <p>We do not guarantee the availability, storage, or retrieval of any emails</p>
              </div>
            </div>
            
            <div className="feature-item negative">
              <i className="fa-solid fa-hourglass-end"></i>
              <div>
                <h5>Time Limits</h5>
                <p>Free plan: 10 minutes | Standard: 12 hours | Premium: 24 hours</p>
              </div>
            </div>
          </div>
          
          <div className="notice-box">
            <i className="fa-solid fa-lightbulb"></i>
            <p>
              <strong>Recommendation:</strong> Do not use Temp-MailHub for important communications, 
              account verification, or critical messages that require long-term access.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'accuracy',
      title: 'Accuracy and Reliability',
      icon: 'fa-solid fa-gauge-high',
      severity: 'medium',
      content: () => (
        <>
          <div className="reliability-metrics">
            <div className="metric-card">
              <div className="metric-value">99%</div>
              <div className="metric-label">Uptime</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '99%' }}></div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">95%</div>
              <div className="metric-label">Delivery Rate</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">&lt;1s</div>
              <div className="metric-label">Average Delay</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="limitations-box">
            <h5>Service Limitations:</h5>
            <ul className="limitations-list">
              <li><i className="fa-solid fa-circle-exclamation"></i> Emails may be lost, delayed, or blocked at any time</li>
              <li><i className="fa-solid fa-circle-exclamation"></i> No warranty regarding uninterrupted operation</li>
              <li><i className="fa-solid fa-circle-exclamation"></i> Service availability may vary by region</li>
              <li><i className="fa-solid fa-circle-exclamation"></i> Email delivery is not guaranteed</li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: 'risk',
      title: 'Use at Your Own Risk',
      icon: 'fa-solid fa-person-falling-burst',
      severity: 'critical',
      content: () => (
        <>
          <div className="risk-warning critical">
            <div className="warning-header">
              <i className="fa-solid fa-skull-crossbones"></i>
              <h4>Critical Risk Notice</h4>
            </div>
            <p>
              Any use of Temp-MailHub.com is entirely at your own risk. We strongly advise against 
              using our service for any critical, important, or sensitive communications.
            </p>
          </div>
          
          <div className="risk-scenarios">
            <div className="scenario-card high-risk">
              <div className="scenario-icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <div className="scenario-content">
                <h5>Lost Communications</h5>
                <p>We are not liable for any issues arising from lost emails or missed communications</p>
              </div>
            </div>
            
            <div className="scenario-card high-risk">
              <div className="scenario-icon">
                <i className="fa-solid fa-server"></i>
              </div>
              <div className="scenario-content">
                <h5>Service Interruptions</h5>
                <p>Service may be interrupted without notice. Always have backup communication methods</p>
              </div>
            </div>
            
            <div className="scenario-card high-risk">
              <div className="scenario-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="scenario-content">
                <h5>Security Incidents</h5>
                <p>While we implement security measures, we cannot guarantee absolute protection</p>
              </div>
            </div>
          </div>
          
          <div className="risk-acceptance">
            <label className="risk-checkbox">
              <input
                type="checkbox"
                checked={riskAccepted}
                onChange={handleRiskAccept}
              />
              <div className="checkbox-content">
                <i className="fa-solid fa-hand"></i>
                <div>
                  <strong>I accept all risks associated with using Temp-MailHub</strong>
                  <small>I understand that I use this service at my own discretion and risk</small>
                </div>
              </div>
            </label>
          </div>
        </>
      )
    },
    {
      id: 'prohibited',
      title: 'Prohibited Uses',
      icon: 'fa-solid fa-ban',
      severity: 'high',
      content: () => (
        <>
          <div className="prohibited-grid">
            <div className="prohibited-item illegal">
              <div className="prohibited-icon">
                <i className="fa-solid fa-gavel"></i>
              </div>
              <div className="prohibited-content">
                <h5>Illegal Activities</h5>
                <p>Any use for unlawful purposes or content distribution</p>
                <span className="prohibited-tag">Zero Tolerance</span>
              </div>
            </div>
            
            <div className="prohibited-item spam">
              <div className="prohibited-icon">
                <i className="fa-solid fa-envelope-open-text"></i>
              </div>
              <div className="prohibited-content">
                <h5>Spam & Phishing</h5>
                <p>Bulk emailing, phishing attempts, or fraudulent activities</p>
                <span className="prohibited-tag">Strictly Forbidden</span>
              </div>
            </div>
            
            <div className="prohibited-item abuse">
              <div className="prohibited-icon">
                <i className="fa-solid fa-user-slash"></i>
              </div>
              <div className="prohibited-content">
                <h5>Harassment & Abuse</h5>
                <p>Harassment, threats, hate speech, or malicious activities</p>
                <span className="prohibited-tag">Immediate Ban</span>
              </div>
            </div>
            
            <div className="prohibited-item security">
              <div className="prohibited-icon">
                <i className="fa-solid fa-shield"></i>
              </div>
              <div className="prohibited-content">
                <h5>Security Violations</h5>
                <p>Attempting to bypass security features or disrupt services</p>
                <span className="prohibited-tag">Permanent Ban</span>
              </div>
            </div>
          </div>
          
          <div className="consequences-box">
            <h5>Consequences of Misuse:</h5>
            <div className="consequences-list">
              <div className="consequence-item">
                <i className="fa-solid fa-user-xmark"></i>
                <div>
                  <h6>Access Restrictions</h6>
                  <p>Temporary or permanent suspension of service access</p>
                </div>
              </div>
              <div className="consequence-item">
                <i className="fa-solid fa-flag"></i>
                <div>
                  <h6>Legal Action</h6>
                  <p>Cooperation with law enforcement for illegal activities</p>
                </div>
              </div>
              <div className="consequence-item">
                <i className="fa-solid fa-database"></i>
                <div>
                  <h6>Data Retention</h6>
                  <p>Logs may be retained for security and legal purposes</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'external',
      title: 'External Links',
      icon: 'fa-solid fa-link',
      severity: 'medium',
      content: () => (
        <>
          <div className="external-links-warning">
            <div className="warning-content">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <div>
                <h4>Third-Party Content Notice</h4>
                <p>
                  Temp-MailHub may contain links to third-party websites or services. 
                  We do not control, endorse, or assume responsibility for any external content.
                </p>
              </div>
            </div>
          </div>
          
          <div className="link-guidelines">
            <h5>Link Guidelines:</h5>
            <div className="guidelines-list">
              <div className="guideline-item">
                <div className="guideline-icon">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <div className="guideline-content">
                  <h6>Independent Verification</h6>
                  <p>Verify the security and legitimacy of external sites before interaction</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <div className="guideline-icon">
                  <i className="fa-solid fa-file-shield"></i>
                </div>
                <div className="guideline-content">
                  <h6>Privacy Policies</h6>
                  <p>Review third-party privacy policies as they differ from ours</p>
                </div>
              </div>
              
              <div className="guideline-item">
                <div className="guideline-icon">
                  <i className="fa-solid fa-hand-point-up"></i>
                </div>
                <div className="guideline-content">
                  <h6>User Discretion</h6>
                  <p>Clicking external links is at your own risk and discretion</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'changes',
      title: 'Changes to Disclaimer',
      icon: 'fa-solid fa-pen-to-square',
      severity: 'low',
      content: () => (
        <>
          <div className="update-process">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h5>Review & Modification</h5>
                <p>We reserve the right to update this disclaimer at any time</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h5>No Prior Notice</h5>
                <p>Changes may be made without prior notification to users</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h5>Immediate Effect</h5>
                <p>Updated disclaimers take effect immediately upon posting</p>
              </div>
            </div>
          </div>
          
          <div className="update-history">
            <h5>Disclaimer Version History:</h5>
            <div className="version-timeline">
              <div className="version-item current">
                <div className="version-date">Jan 04, 2025</div>
                <div className="version-details">
                  <h6>Current Version (v1.0)</h6>
                  <p>Initial disclaimer release</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="responsibility-note">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              <strong>Your Responsibility:</strong> It is your responsibility to periodically review this 
              disclaimer for any changes. Continued use of our services after updates constitutes 
              acceptance of the modified disclaimer.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'contact',
      title: 'Contact & Support',
      icon: 'fa-solid fa-headset',
      severity: 'info',
      content: () => (
        <>
         
          
          <div className="contact-guidelines">
            <h5>Contact Guidelines:</h5>
            <ul className="guidelines-list">
              <li><i className="fa-solid fa-check"></i> Include relevant details in your inquiry</li>
              <li><i className="fa-solid fa-check"></i> Allow reasonable time for response</li>
              <li><i className="fa-solid fa-check"></i> Use appropriate contact for your concern</li>
              <li><i className="fa-solid fa-check"></i> Check FAQ before contacting support</li>
            </ul>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="disclaimer-page">
      <div className="disclaimer-container">
        {/* Header */}
        <div className="disclaimer-header">
          <div className="header-content">
            <h1 className="disclaimer-title">
              <i className="fa-solid fa-triangle-exclamation"></i>
              Legal Disclaimer
            </h1>
            <p className="disclaimer-subtitle">
              Important legal information regarding the use of Temp-MailHub services. 
              Please read carefully before proceeding.
            </p>
          </div>
          
          <div className="header-meta">
            <div className="meta-item">
              <i className="fa-solid fa-calendar"></i>
              <div>
                <span>Effective Date</span>
                <strong>January 04, 2025</strong>
              </div>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-file-contract"></i>
              <div>
                <span>Document Type</span>
                <strong>Legal Disclaimer</strong>
              </div>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-clock"></i>
              <div>
                <span>Reading Time</span>
                <strong>~7 minutes</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="critical-notice">
          <div className="notice-content">
            <div className="notice-icon">
              <i className="fa-solid fa-skull-crossbones"></i>
            </div>
            <div className="notice-text">
              <h3>Critical Legal Notice</h3>
              <p>
                This disclaimer contains important information about the risks, limitations, 
                and responsibilities associated with using Temp-MailHub. By using our services, 
                you acknowledge and accept these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Sections */}
        <div className="disclaimer-sections">
          {sections.map((section) => (
            <div 
              key={section.id} 
              className={`disclaimer-section severity-${section.severity} ${expandedSections[section.id] ? 'expanded' : 'collapsed'}`}
            >
              <div 
                className="section-header"
                onClick={() => toggleSection(section.id)}
              >
                <div className="section-title">
                  <div className="section-severity">
                    <i className={section.icon}></i>
                    <span className={`severity-badge ${section.severity}`}>
                      {section.severity.charAt(0).toUpperCase() + section.severity.slice(1)}
                    </span>
                  </div>
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

        {/* Acceptance Section */}
        <div className="acceptance-section">
          <div className="acceptance-header">
            <h3><i className="fa-solid fa-file-signature"></i> Disclaimer Acceptance</h3>
            <p>Please confirm that you have read and understood this disclaimer</p>
          </div>
          
          <div className="acceptance-content">
            <div className="acknowledgment-box">
              <label className="acknowledgment-checkbox">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={handleAcknowledge}
                />
                <div className="checkbox-label">
                  <i className="fa-solid fa-scroll"></i>
                  <div>
                    <strong>I acknowledge reading the entire disclaimer</strong>
                    <small>
                      I understand that Temp-MailHub is a temporary email service with inherent 
                      limitations and risks, and I agree to use it accordingly.
                    </small>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="acceptance-actions">
              <button 
                className="btn btn-primary"
                onClick={handleAcknowledge}
                disabled={acknowledged}
              >
                {acknowledged ? (
                  <>
                    <i className="fa-solid fa-check-circle"></i>
                    Acknowledged
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-thumbs-up"></i>
                    Acknowledge Disclaimer
                  </>
                )}
              </button>
              
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i>
                Print Disclaimer
              </button>
            </div>
            
            <div className="acceptance-footer">
              <p>
                <i className="fa-solid fa-info-circle"></i>
                Your acknowledgment helps us ensure users understand our service limitations. 
                This does not constitute a waiver of any legal rights.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="disclaimer-footer">
          <div className="footer-content">
            <div className="legal-info">
              <h5><i className="fa-solid fa-scale-balanced"></i> Legal Information</h5>
              <p>
                This disclaimer is governed by and construed in accordance with the laws of 
                the State of Texas, United States. Any disputes shall be resolved in Texas courts.
              </p>
            </div>
            
            <div className="copyright-info">
              <p>
                <i className="fa-solid fa-copyright"></i> 2025 D-Tech Studios. All rights reserved.
                Temp-MailHub is a product of D-Tech Studios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
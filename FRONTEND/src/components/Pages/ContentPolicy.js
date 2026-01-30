import React, { useState, useEffect } from 'react';
import './PagesCss/LegalInformation.css';

const ContentPolicy = () => {
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [violations, setViolations] = useState({
    spam: false,
    illegal: false,
    impersonation: false,
    malware: false,
    harassment: false
  });
  const [expandedSections, setExpandedSections] = useState({});

  // Initialize all sections as expanded
  useEffect(() => {
    const sections = [
      'prohibited', 'responsibility', 'moderation', 
      'reporting', 'disclaimer'
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

  const toggleViolation = (violation) => {
    setViolations(prev => ({
      ...prev,
      [violation]: !prev[violation]
    }));
  };

  const handlePolicyAccept = () => {
    if (!policyAccepted) {
      setPolicyAccepted(true);
      // In a real app, save to localStorage or backend
      localStorage.setItem('contentPolicyAccepted', 'true');
    }
  };

  const handleReportViolation = () => {
    // In a real app, this would open a reporting form
    alert('Thank you for helping us maintain a safe community. Our team will review your report promptly.');
  };

  const prohibitedItems = [
    {
      id: 'spam',
      title: 'Spam and Abuse',
      icon: 'fa-solid fa-envelope-open-text',
      description: 'Using temporary emails for sending spam, phishing, or any abusive activities',
      severity: 'high',
      examples: [
        'Unsolicited bulk emailing',
        'Phishing attempts',
        'Commercial spamming',
        'Bot-driven abuse'
      ]
    },
    {
      id: 'illegal',
      title: 'Illegal Activities',
      icon: 'fa-solid fa-gavel',
      description: 'Using our service for illegal activities including fraud, hacking, or identity theft',
      severity: 'critical',
      examples: [
        'Financial fraud schemes',
        'Identity theft operations',
        'Hacking attempts',
        'Drug trafficking communications'
      ]
    },
    {
      id: 'impersonation',
      title: 'Impersonation',
      icon: 'fa-solid fa-user-secret',
      description: 'Impersonating others or creating misleading identities',
      severity: 'medium',
      examples: [
        'Fake identity creation',
        'Brand impersonation',
        'Government agency impersonation',
        'Celebrity impersonation'
      ]
    },
    {
      id: 'malware',
      title: 'Malware Distribution',
      icon: 'fa-solid fa-virus',
      description: 'Uploading, sending, or distributing harmful software, viruses, or malware',
      severity: 'critical',
      examples: [
        'Virus distribution',
        'Ransomware campaigns',
        'Spyware distribution',
        'Botnet command centers'
      ]
    },
    {
      id: 'harassment',
      title: 'Harassment and Threats',
      icon: 'fa-solid fa-handcuffs',
      description: 'Any form of harassment, threats, or abusive behavior towards others',
      severity: 'high',
      examples: [
        'Cyberbullying',
        'Threats of violence',
        'Hate speech',
        'Stalking behavior'
      ]
    }
  ];

  const userResponsibilities = [
    {
      icon: 'fa-solid fa-user-shield',
      title: 'Account Responsibility',
      description: 'Users are fully responsible for all activities conducted through their temporary email accounts',
      note: 'This includes any emails sent or received using our service'
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      title: 'Ethical Usage',
      description: 'Users must not use the service for malicious, unethical, or harmful purposes',
      note: 'Always consider the impact of your actions on others'
    },
    {
      icon: 'fa-solid fa-triangle-exclamation',
      title: 'Critical Information',
      description: 'Do not rely on Temp-MailHub for receiving critical or sensitive information',
      note: 'Use permanent email services for important communications'
    }
  ];

  const enforcementActions = [
    {
      action: 'Immediate Suspension',
      description: 'Access may be suspended immediately for severe violations',
      icon: 'fa-solid fa-user-slash'
    },
    {
      action: 'Permanent Ban',
      description: 'Repeat offenders may face permanent account termination',
      icon: 'fa-solid fa-ban'
    },
    {
      action: 'Legal Reporting',
      description: 'Serious violations will be reported to relevant authorities',
      icon: 'fa-solid fa-flag'
    },
    {
      action: 'Data Retention',
      description: 'Violation data may be retained for legal purposes',
      icon: 'fa-solid fa-database'
    }
  ];

  const reportingMethods = [
    {
      method: 'In-App Reporting',
      description: 'Use the report button within the application',
      icon: 'fa-solid fa-flag',
      responseTime: '24-48 hours'
    },
    {
      method: 'Email Reporting',
      description: 'Send detailed reports to abuse@temp-mailhub.com',
      icon: 'fa-solid fa-envelope',
      responseTime: '24-72 hours'
    },
    {
      method: 'Emergency Contact',
      description: 'For urgent legal matters: legal@temp-mailhub.com',
      icon: 'fa-solid fa-triangle-exclamation',
      responseTime: 'Immediate'
    }
  ];

  return (
    <div className="content-policy-page">
      <div className="content-policy-container">
        {/* Header */}
        <div className="policy-header">
          <div className="header-content">
            <h1 className="policy-title">
              <i className="fa-solid fa-file-shield"></i>
              Content Policy
            </h1>
            <p className="policy-subtitle">
              Guidelines for responsible use of Temp-MailHub services. 
              Our commitment to maintaining a safe and respectful platform.
            </p>
          </div>
          
          <div className="header-meta">
            <div className="meta-item">
              <i className="fa-solid fa-calendar-check"></i>
              <div>
                <span>Effective Date</span>
                <strong>January 04, 2025</strong>
              </div>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-users"></i>
              <div>
                <span>Applies To</span>
                <strong>All Users</strong>
              </div>
            </div>
            <div className="meta-item">
              <i className="fa-solid fa-scale-balanced"></i>
              <div>
                <span>Policy Type</span>
                <strong>Mandatory</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="policy-intro">
          <div className="intro-card">
            <div className="intro-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="intro-content">
              <h3>Our Commitment to Safety</h3>
              <p>
                Temp-MailHub is dedicated to providing a secure, respectful, and reliable platform 
                for all users. This Content Policy outlines the guidelines that govern appropriate 
                use of our temporary email services.
              </p>
            </div>
          </div>
        </div>

        {/* Prohibited Activities */}
        <section id="prohibited" className="policy-section">
          <div className="section-header">
            <div className="section-title">
              <h2><i className="fa-solid fa-ban"></i> Prohibited Activities</h2>
              <span className="section-subtitle">Zero-tolerance violations that may result in immediate action</span>
            </div>
            <button 
              className="section-toggle"
              onClick={() => toggleSection('prohibited')}
            >
              <i className={`fa-solid fa-chevron-${expandedSections.prohibited ? 'up' : 'down'}`}></i>
            </button>
          </div>
          
          {expandedSections.prohibited && (
            <div className="section-content">
              <div className="prohibited-grid">
                {prohibitedItems.map((item) => (
                  <div key={item.id} className={`prohibited-item severity-${item.severity}`}>
                    <div className="prohibited-header">
                      <div className="prohibited-icon">
                        <i className={item.icon}></i>
                        <span className={`severity-badge ${item.severity}`}>
                          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                        </span>
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                    
                    <p className="prohibited-description">{item.description}</p>
                    
                    <div className="examples-section">
                      <h4>Examples Include:</h4>
                      <ul className="examples-list">
                        {item.examples.map((example, index) => (
                          <li key={index}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <label className="violation-checkbox">
                      <input
                        type="checkbox"
                        checked={violations[item.id]}
                        onChange={() => toggleViolation(item.id)}
                      />
                      <span>I understand this is prohibited</span>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="policy-note warning">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <div>
                  <h4>Important Notice</h4>
                  <p>
                    Violation of these prohibitions may result in immediate account suspension, 
                    permanent ban, and legal action where applicable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* User Responsibilities */}
        <section id="responsibility" className="policy-section">
          <div className="section-header">
            <div className="section-title">
              <h2><i className="fa-solid fa-user-check"></i> User Responsibilities</h2>
              <span className="section-subtitle">Your role in maintaining a safe community</span>
            </div>
            <button 
              className="section-toggle"
              onClick={() => toggleSection('responsibility')}
            >
              <i className={`fa-solid fa-chevron-${expandedSections.responsibility ? 'up' : 'down'}`}></i>
            </button>
          </div>
          
          {expandedSections.responsibility && (
            <div className="section-content">
              <div className="responsibilities-grid">
                {userResponsibilities.map((responsibility, index) => (
                  <div key={index} className="responsibility-card">
                    <div className="responsibility-icon">
                      <i className={responsibility.icon}></i>
                    </div>
                    <div className="responsibility-content">
                      <h3>{responsibility.title}</h3>
                      <p>{responsibility.description}</p>
                      <div className="responsibility-note">
                        <i className="fa-solid fa-info-circle"></i>
                        <span>{responsibility.note}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="best-practices">
                <h3><i className="fa-solid fa-star"></i> Best Practices</h3>
                <div className="practices-list">
                  <div className="practice-item">
                    <i className="fa-solid fa-check"></i>
                    <span>Use temporary emails only for appropriate purposes</span>
                  </div>
                  <div className="practice-item">
                    <i className="fa-solid fa-check"></i>
                    <span>Respect others' privacy and boundaries</span>
                  </div>
                  <div className="practice-item">
                    <i className="fa-solid fa-check"></i>
                    <span>Report suspicious activities immediately</span>
                  </div>
                  <div className="practice-item">
                    <i className="fa-solid fa-check"></i>
                    <span>Keep your account credentials secure</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Moderation and Enforcement */}
        <section id="moderation" className="policy-section">
          <div className="section-header">
            <div className="section-title">
              <h2><i className="fa-solid fa-gavel"></i> Moderation & Enforcement</h2>
              <span className="section-subtitle">How we ensure policy compliance</span>
            </div>
            <button 
              className="section-toggle"
              onClick={() => toggleSection('moderation')}
            >
              <i className={`fa-solid fa-chevron-${expandedSections.moderation ? 'up' : 'down'}`}></i>
            </button>
          </div>
          
          {expandedSections.moderation && (
            <div className="section-content">
              <div className="enforcement-process">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Automated Monitoring</h4>
                    <p>Our systems continuously monitor for policy violations</p>
                  </div>
                </div>
                
                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Human Review</h4>
                    <p>Flagged activities are reviewed by our moderation team</p>
                  </div>
                </div>
                
                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Action Taken</h4>
                    <p>Appropriate enforcement actions are implemented</p>
                  </div>
                </div>
                
                <div className="process-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Appeal Process</h4>
                    <p>Users can appeal decisions through proper channels</p>
                  </div>
                </div>
              </div>
              
              <div className="enforcement-actions">
                <h3>Possible Enforcement Actions</h3>
                <div className="actions-grid">
                  {enforcementActions.map((action, index) => (
                    <div key={index} className="action-card">
                      <div className="action-icon">
                        <i className={action.icon}></i>
                      </div>
                      <div className="action-content">
                        <h4>{action.action}</h4>
                        <p>{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Reporting Violations */}
        <section id="reporting" className="policy-section">
          <div className="section-header">
            <div className="section-title">
              <h2><i className="fa-solid fa-flag"></i> Reporting Violations</h2>
              <span className="section-subtitle">Help us maintain a safe community</span>
            </div>
            <button 
              className="section-toggle"
              onClick={() => toggleSection('reporting')}
            >
              <i className={`fa-solid fa-chevron-${expandedSections.reporting ? 'up' : 'down'}`}></i>
            </button>
          </div>
          
          {expandedSections.reporting && (
            <div className="section-content">
              <div className="reporting-intro">
                <div className="intro-content">
                  <i className="fa-solid fa-handshake"></i>
                  <div>
                    <h3>Community Partnership</h3>
                    <p>
                      We rely on our community to help identify and report policy violations. 
                      Your reports help us maintain a safe environment for everyone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="reporting-methods">
                <h3>How to Report</h3>
                <div className="methods-grid">
                  {reportingMethods.map((method, index) => (
                    <div key={index} className="method-card">
                      <div className="method-header">
                        <div className="method-icon">
                          <i className={method.icon}></i>
                        </div>
                        <div className="method-info">
                          <h4>{method.method}</h4>
                          <span className="response-time">
                            <i className="fa-solid fa-clock"></i>
                            {method.responseTime}
                          </span>
                        </div>
                      </div>
                      <p className="method-description">{method.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="reporting-guidelines">
                <h3>Reporting Guidelines</h3>
                <div className="guidelines-list">
                  <div className="guideline">
                    <i className="fa-solid fa-clipboard-check"></i>
                    <div>
                      <h5>Provide Evidence</h5>
                      <p>Include screenshots, email headers, or other relevant evidence</p>
                    </div>
                  </div>
                  <div className="guideline">
                    <i className="fa-solid fa-calendar-day"></i>
                    <div>
                      <h5>Timely Reporting</h5>
                      <p>Report violations as soon as they occur for prompt action</p>
                    </div>
                  </div>
                  <div className="guideline">
                    <i className="fa-solid fa-file-alt"></i>
                    <div>
                      <h5>Detailed Description</h5>
                      <p>Provide clear details about the violation and context</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="report-action">
                <button className="report-btn" onClick={handleReportViolation}>
                  <i className="fa-solid fa-flag"></i>
                  Report a Violation
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <section id="disclaimer" className="policy-section">
          <div className="section-header">
            <div className="section-title">
              <h2><i className="fa-solid fa-circle-info"></i> Legal Disclaimer</h2>
              <span className="section-subtitle">Important legal information</span>
            </div>
            <button 
              className="section-toggle"
              onClick={() => toggleSection('disclaimer')}
            >
              <i className={`fa-solid fa-chevron-${expandedSections.disclaimer ? 'up' : 'down'}`}></i>
            </button>
          </div>
          
          {expandedSections.disclaimer && (
            <div className="section-content">
              <div className="disclaimer-notice warning">
                <div className="notice-icon">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="notice-content">
                  <h3>Important Legal Notice</h3>
                  <p>
                    Temp-MailHub is a temporary email service provider. We facilitate communication 
                    but are not responsible for the content exchanged through our platform.
                  </p>
                </div>
              </div>
              
              <div className="disclaimer-points">
                <div className="point-item">
                  <div className="point-icon">
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                  <div className="point-content">
                    <h4>User Accountability</h4>
                    <p>
                      Temp-MailHub is not responsible for any misuse of the service by users. 
                      Users are solely accountable for their actions and content.
                    </p>
                  </div>
                </div>
                
                <div className="point-item">
                  <div className="point-icon">
                    <i className="fa-solid fa-server"></i>
                  </div>
                  <div className="point-content">
                    <h4>Service Reliability</h4>
                    <p>
                      We do not guarantee the reliability, availability, or uninterrupted operation 
                      of temporary email addresses.
                    </p>
                  </div>
                </div>
                
                <div className="point-item">
                  <div className="point-icon">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <div className="point-content">
                    <h4>Legal Compliance</h4>
                    <p>
                      Users must ensure their use of our service complies with all applicable 
                      laws and regulations in their jurisdiction.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="policy-note">
                <i className="fa-solid fa-lightbulb"></i>
                <div>
                  <h4>Responsible Usage</h4>
                  <p>
                    We encourage all users to use Temp-MailHub responsibly and ethically. 
                    Your cooperation helps us maintain a valuable service for everyone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Acceptance Section */}
        <div className="acceptance-section">
          <div className="acceptance-header">
            <h2><i className="fa-solid fa-file-signature"></i> Policy Acceptance</h2>
            <p>Confirm your understanding and agreement with our Content Policy</p>
          </div>
          
          <div className="acceptance-content">
            <div className="acknowledgment">
              <label className="acknowledgment-checkbox">
                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={handlePolicyAccept}
                />
                <div className="checkbox-content">
                  <i className="fa-solid fa-scroll"></i>
                  <div>
                    <strong>I have read and agree to the Content Policy</strong>
                    <small>
                      I understand the prohibited activities, my responsibilities, and the 
                      enforcement measures described above.
                    </small>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="acceptance-stats">
              <div className="stat-item">
                <i className="fa-solid fa-shield-halved"></i>
                <div>
                  <h3>Safe Community</h3>
                  <p>Your agreement helps maintain security</p>
                </div>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-users"></i>
                <div>
                  <h3>Shared Responsibility</h3>
                  <p>We all contribute to platform safety</p>
                </div>
              </div>
            </div>
            
            <div className="acceptance-actions">
              <button 
                className="btn btn-primary"
                onClick={handlePolicyAccept}
                disabled={policyAccepted}
              >
                {policyAccepted ? (
                  <>
                    <i className="fa-solid fa-check-circle"></i>
                    Policy Accepted
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-thumbs-up"></i>
                    Accept Content Policy
                  </>
                )}
              </button>
              
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i>
                Print Policy
              </button>
            </div>
          </div>
          
          <div className="acceptance-footer">
            <div className="footer-content">
              <p>
                <i className="fa-solid fa-heart"></i>
                Thank you for helping us create a safe and respectful environment for all Temp-MailHub users.
              </p>
              <div className="copyright">
                <i className="fa-solid fa-copyright"></i>
                <span>D-Tech Studios © 2025. Temp-MailHub is a product of D-Tech Studios.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPolicy;
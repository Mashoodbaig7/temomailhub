import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./PagesCss/PrivateDomains.css";
import "./PagesCss/f&q.css";
import { domainAPI, customDomainAPI, subscriptionAPI } from "../../services/api";
import UpgradeModal from "./UpgradeModal";

const faqs = [
  {
    id: 1,
    header: "What are Private Domains?",
    text: "Private Domains are exclusive domains managed through Cloudflare. Once nameservers are configured, email routing is automatically set up for receiving temporary emails.",
  },
  {
    id: 2,
    header: "How do I add a Private Domain?",
    text: "Enter your domain name and click 'Add Domain'. The system will create a Cloudflare zone and provide nameservers. Update these nameservers at your domain registrar, then verify.",
  },
  {
    id: 3,
    header: "What happens after I add my domain?",
    text: "You'll receive Cloudflare nameservers to update at your domain registrar. Once nameservers are updated and propagated (15-30 minutes), verify your domain to enable automatic email routing.",
  },
  {
    id: 4,
    header: "Do I need to configure MX records manually?",
    text: "No! Once you update nameservers to Cloudflare, our system automatically configures all email routing, MX records, and DNS settings through the Cloudflare API.",
  },
  {
    id: 5,
    header: "How long does DNS propagation take?",
    text: "Typically 15-30 minutes, but can take up to 48 hours. You can check propagation status at whatsmydns.net before verifying your domain.",
  },
  {
    id: 6,
    header: "What are domain limits per plan?",
    text: "Free: 0 domains, Standard: 3 domains/month, Premium: 10 domains/month. Custom email generation limits also apply per plan.",
  },
  {
    id: 7,
    header: "Can I delete a domain?",
    text: "Yes, click the delete button next to any domain. This will remove the domain from your account and delete the Cloudflare zone configuration.",
  },
  {
    id: 8,
    header: "What if verification fails?",
    text: "Ensure you've updated nameservers correctly at your registrar. Wait 15-30 minutes for DNS propagation, then try verification again. Check whatsmydns.net for propagation status.",
  },
  {
    id: 9,
    header: "Can I use multiple domains?",
    text: "Yes, based on your plan limits. All active domains will be available for generating temporary email addresses on the home page.",
  },
];

const AccordionItem = (props) => {
  const contentEl = useRef();
  const { handleToggle, active, faq } = props;
  const { header, id, text } = faq;

  return (
    <div className="rc-accordion-card">
      <div className="rc-accordion-header">
        <div
          className={`rc-accordion-toggle p-3 ${active === id ? "active" : ""}`}
          onClick={() => handleToggle(id)}
        >
          <h5 className="rc-accordion-title">{header}</h5>
          <i className="fa fa-chevron-down rc-accordion-icon"></i>
        </div>
      </div>
      <div
        ref={contentEl}
        className={`rc-collapse ${active === id ? "show" : ""}`}
        style={
          active === id
            ? { height: contentEl.current.scrollHeight }
            : { height: "0px" }
        }
      >
            <div className="rc-accordion-body">
              <p className="mb-0">{text}</p>
            </div>
          </div>
        </div>
      );
    };
const PrivateDomains = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");
  const [customDomains, setCustomDomains] = useState([]);
  const [showError, setShowError] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [active, setActive] = useState(null);
  const [isVerifying, setIsVerifying] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [expandedInstructions, setExpandedInstructions] = useState({});

  // Check user authentication and subscription
  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Check if user is logged in
      if (!token) {
        setHasAccess(false);
        setIsLoading(false);
        setShowUpgradeModal(true);
        return;
      }

      // Check user subscription
      const subscriptionResponse = await subscriptionAPI.getMySubscription();
      const plan = subscriptionResponse.data.currentPlan;
      setUserPlan(plan);

      // Standard and Premium users can access
      if (plan === 'Standard' || plan === 'Premium') {
        setHasAccess(true);
        loadCustomDomains(); // Load Cloudflare domains
        loadUsageStats(); // Load usage statistics
      } else {
        setHasAccess(false);
        setShowUpgradeModal(true);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Access check error:', error);
      setHasAccess(false);
      setIsLoading(false);
      setShowUpgradeModal(true);
    }
  };

  const handleUpgradeClose = () => {
    setShowUpgradeModal(false);
    navigate('/'); // Redirect to home if they close the modal
  };

  // Load usage statistics
  const loadUsageStats = async () => {
    try {
      const response = await domainAPI.getUsageStats();
      if (response.success) {
        setUsageStats(response.data);
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  // Load Cloudflare custom domains
  const loadCustomDomains = async () => {
    try {
      const response = await customDomainAPI.getAll();
      if (response.success) {
        setCustomDomains(response.data || []);
      }
    } catch (error) {
      console.error('Error loading custom domains:', error);
    }
  };

  const validateDomain = (domain) => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  };

  // Add Cloudflare custom domain
  const addDomain = async () => {
    const trimmedDomain = domain.trim().toLowerCase();
    
    if (!trimmedDomain) {
      setShowError(true);
      setCopyFeedback("Please enter a domain name");
      toast.error("Please enter a domain name");
      return;
    }
    
    if (!validateDomain(trimmedDomain)) {
      setShowError(true);
      setCopyFeedback("Please enter a valid domain name (e.g., example.com)");
      toast.error("Please enter a valid domain name (e.g., example.com)");
      return;
    }
    
    setShowError(false);
    setCopyFeedback(null);
    setIsVerifying(prev => ({ ...prev, [trimmedDomain]: true }));
    
    try {
      const response = await customDomainAPI.add(trimmedDomain);
      
      if (response.success) {
        setCopyFeedback(`✓ Domain added! Please update nameservers.`);
        toast.success(`✓ Domain "${trimmedDomain}" added successfully! Please update nameservers at your registrar.`);
        setDomain("");
        loadCustomDomains(); // Reload Cloudflare domains
        loadUsageStats();
        
        // Auto-expand instructions for the new domain
        setTimeout(() => {
          setExpandedInstructions(prev => ({
            ...prev,
            [response.data.domainId]: true
          }));
        }, 500);
      }
    } catch (error) {
      console.error('Error adding custom domain:', error);
      const errorMessage = error.response?.data?.message || "Failed to add domain. Please try again.";
      setCopyFeedback(errorMessage);
      setShowError(true);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(prev => ({ ...prev, [trimmedDomain]: false }));
    }
    
    setTimeout(() => {
      setCopyFeedback(null);
      setShowError(false);
    }, 5000);
  };

  // Verify Cloudflare custom domain
  const verifyDomain = async (domainId, domainName) => {
    setIsVerifying(prev => ({ ...prev, [domainName]: true }));
    
    try {
      const response = await customDomainAPI.verify(domainId);
      
      if (response.success) {
        setCopyFeedback(`🎉 ${domainName} is now active!`);
        toast.success(`🎉 ${domainName} is now active and ready to receive emails!`);
        loadCustomDomains();
        loadUsageStats();
      } else {
        // Nameservers not updated yet
        const message = response.message || '⏳ Nameservers not updated yet. Please update nameservers at your registrar.';
        setCopyFeedback(message);
        setShowError(true);
        toast.warning(message);
        setExpandedInstructions(prev => ({ ...prev, [domainId]: true }));
      }
    } catch (error) {
      console.error('Error verifying custom domain:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      setCopyFeedback(errorMessage);
      setShowError(true);
      toast.error(errorMessage);
      
      // Auto-expand instructions on error
      setExpandedInstructions(prev => ({ ...prev, [domainId]: true }));
    } finally {
      setIsVerifying(prev => ({ ...prev, [domainName]: false }));
    }
    
    setTimeout(() => {
      setCopyFeedback(null);
      setShowError(false);
    }, 5000);
  };

  // Delete Cloudflare custom domain
  const deleteDomain = async (domainId, domainName) => {
    if (!window.confirm(`Are you sure you want to delete "${domainName}"?`)) {
      return;
    }

    try {
      const response = await customDomainAPI.delete(domainId);
      if (response.success) {
        setCopyFeedback(`Domain "${domainName}" deleted`);
        toast.success(`Domain "${domainName}" deleted successfully`);
        loadCustomDomains();
        loadUsageStats();
      }
    } catch (error) {
      console.error('Error deleting custom domain:', error);
      const errorMessage = error.response?.data?.message || "Failed to delete domain";
      setCopyFeedback(errorMessage);
      toast.error(errorMessage);
    }
    
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Toggle instructions visibility
  const toggleInstructions = (domainId) => {
    setExpandedInstructions(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };

  const handleCopy = (domain) => {
    navigator.clipboard
      .writeText(domain)
      .then(() => {
        setCopyFeedback(`Copied: ${domain}`);
        setTimeout(() => setCopyFeedback(null), 2000);
      })
      .catch((err) => console.error("Copy failed:", err));
  };

  const handleToggle = (id) => {
    setActive(active === id ? null : id);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addDomain();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="private-domains-container">
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin" style={{fontSize: '48px', color: '#667eea'}}></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show upgrade modal if no access
  if (!hasAccess) {
    return (
      <>
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={handleUpgradeClose}
          feature="Custom Domains"
        />
        <div className="private-domains-container">
          <div className="no-access-container">
            <div className="no-access-content">
              <i className="fa-solid fa-lock" style={{fontSize: '64px', color: '#16423C', marginBottom: '20px'}}></i>
              <h2>Premium Feature</h2>
              <p>Custom domains are available for Standard and Premium subscribers.</p>
              <p style={{marginTop: '10px', color: '#666'}}>Upgrade your plan to use custom domains.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="private-domains-container">
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature="Custom Domains"
      />
      
      {/* Header Section */}
      <div className="domains-header-section">
        <div className="header-content">
          <h1 className="main-title">Private Domains</h1>
          <p className="subtitle">
            Add and verify domains for exclusive temporary email addresses
          </p>
        </div>
      </div>

      <div className="domains-content-wrapper">
        {/* Left Side - Domain Management */}
        <div className="domains-management-section">
          <div className="domain-input-section">
            <div className="input-header">
              <h2>
                <i className="fa-brands fa-cloudflare"></i> Add New Domain
              </h2>
              <p className="input-description">
                Add your domain and configure Cloudflare nameservers for automated email routing.
              </p>
            </div>

            <div className="domain-input-container">
              <div className="domain-input-group">
                <input
                  type="text"
                  className="domain-input"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setShowError(false);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addDomain();
                    }
                  }}
                />
                <button
                  onClick={addDomain}
                  className="add-domain-btn"
                  aria-label="Add domain"
                  disabled={isVerifying[domain]}
                >
                  {isVerifying[domain] ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Adding...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus"></i> Add Domain
                    </>
                  )}
                </button>
              </div>

              {(showError || copyFeedback) && (
                <div className={showError ? "error-message" : "success-message"}>
                  <i className={showError ? "fa-solid fa-exclamation-circle" : "fa-solid fa-check-circle"}></i>
                  <span>{copyFeedback || "Please enter a valid domain name"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Usage Stats Section */}
          {usageStats && (
            <div className="usage-stats-section">
              <div className="stats-header">
                <h3>
                  <i className="fa-solid fa-chart-bar"></i> Usage Statistics - {usageStats.currentPlan} Plan
                </h3>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa-solid fa-globe"></i>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Domains This Month</p>
                    <p className="stat-value">
                      {usageStats.usage.domainsAddedThisMonth} / {usageStats.limits.domainsPerMonth}
                    </p>
                    <div className="stat-progress">
                      <div 
                        className="stat-progress-bar"
                        style={{
                          width: `${(usageStats.usage.domainsAddedThisMonth / usageStats.limits.domainsPerMonth) * 100}%`,
                          backgroundColor: usageStats.usage.domainsAddedThisMonth >= usageStats.limits.domainsPerMonth ? '#f44336' : '#4caf50'
                        }}
                      ></div>
                    </div>
                    <p className="stat-remaining">{usageStats.remaining.domains} remaining</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Custom Emails This MON</p>
                    <p className="stat-value">
                      {usageStats.usage.customEmailsCreatedThisMonth} / {usageStats.limits.customEmailsPerMonth}
                    </p>
                    <div className="stat-progress">
                      <div 
                        className="stat-progress-bar"
                        style={{
                          width: `${(usageStats.usage.customEmailsCreatedThisMonth / usageStats.limits.customEmailsPerMonth) * 100}%`,
                          backgroundColor: usageStats.usage.customEmailsCreatedThisMonth >= usageStats.limits.customEmailsPerMonth ? '#f44336' : '#2196f3'
                        }}
                      ></div>
                    </div>
                    <p className="stat-remaining">{usageStats.remaining.customEmails} remaining</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa-solid fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Active Domains</p>
                    <p className="stat-value">
                      {usageStats.usage.activeDomains} verified
                    </p>
                    <p className="stat-detail">
                      {usageStats.usage.pendingDomains} pending verification
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Custom Email Expiry</p>
                    <p className="stat-value">
                      {usageStats.limits.customEmailExpiry / 60} hours
                    </p>
                    <p className="stat-detail">
                      Auto-delete after expiry
                    </p>
                  </div>
                </div>
              </div>
              <div className="stats-note">
                <i className="fa-solid fa-info-circle"></i>
                <span>Limits reset monthly. Custom email limit is combined across all domains.</span>
              </div>
            </div>
          )}

          {/* Domains List Section */}
          {customDomains.length > 0 && (
            <div className="domains-list-section">
              <div className="list-header">
                <h3 style={{color: 'black'}}>
                  <i className="fa-solid fa-list-check"></i>
                  Your Domains ({customDomains.filter(d => d.status === 'Active').length} active, {customDomains.filter(d => d.status === 'Pending').length} pending)
                </h3>
              </div>

              {copyFeedback && (
                <div className="copy-feedback">
                  <i className="fa-solid fa-check-circle"></i>
                  {copyFeedback}
                </div>
              )}

              <div className="domains-grid">
                {customDomains.map((domain, index) => (
                  <div key={domain._id} className="domain-card">
                    <div className="domain-card-header">
                      <div className="domain-number">
                        <span className="number-badge">{index + 1}</span>
                        <div className="domain-status-container">
                          <h4>Cloudflare Domain</h4>
                          <span className={`status-badge status-${domain.status === 'Active' ? 'verified' : 'pending'}`}>
                            {domain.status === 'Active' ? '✓ Active' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() => handleCopy(domain.domainName)}
                          className="copy-domain-btn"
                          aria-label="Copy domain"
                        >
                          <i className="fa-solid fa-copy"></i>
                        </button>
                        <button
                          onClick={() => deleteDomain(domain._id, domain.domainName)}
                          className="delete-domain-btn"
                          aria-label="Delete domain"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="domain-card-body">
                      <div className="domain-content">
                        <i className="fa-brands fa-cloudflare domain-icon"></i>
                        <div className="domain-info">
                          <span className="domain-label">Domain Address</span>
                          <p className="domain-value" title={domain.domainName}>
                            {domain.domainName}
                          </p>
                        </div>
                      </div>
                      
                      {domain.status === 'Active' && domain.emailRoutingEnabled ? (
                          <div className="verification-details">
                            <div className="verified-info">
                              <i className="fa-solid fa-check-circle verified-icon"></i>
                              <span>Email routing active • Cloudflare managed</span>
                            </div>
                            {domain.verifiedAt && (
                              <div className="verified-date">
                                <i className="fa-solid fa-calendar-check"></i>
                                <span>Verified: {new Date(domain.verifiedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="verification-instructions">
                            <div className="verification-header">
                              <i className="fa-brands fa-cloudflare"></i>
                              <h5>Update Nameservers</h5>
                            </div>
                            <p className="verification-subtitle">
                              Change your domain's nameservers to Cloudflare to activate email routing:
                            </p>
                            
                            <button
                              onClick={() => toggleInstructions(domain._id)}
                              className="toggle-ns-btn"
                            >
                              <i className={`fa-solid fa-chevron-${expandedInstructions[domain._id] ? 'up' : 'down'}`}></i>
                              {expandedInstructions[domain._id] ? 'Hide' : 'Show'} Nameservers
                            </button>

                            {expandedInstructions[domain._id] && (
                              <div className="nameservers-list">
                                {domain.nameservers && domain.nameservers.map((ns, idx) => (
                                  <div key={idx} className="dns-field">
                                    <label>Nameserver {idx + 1}:</label>
                                    <code>{ns}</code>
                                    <button 
                                      className="copy-icon-btn" 
                                      onClick={() => handleCopy(ns)}
                                      title="Copy nameserver"
                                    >
                                      <i className="fa-solid fa-copy"></i>
                                    </button>
                                  </div>
                                ))}
                                
                                <div className="dns-instructions">
                                  <p><strong>Steps:</strong></p>
                                  <ol>
                                    <li>Go to your domain registrar's control panel</li>
                                    <li>Find the nameserver settings</li>
                                    <li>Replace existing nameservers with Cloudflare's</li>
                                    <li>Wait 5-10 minutes for DNS propagation</li>
                                    <li>Click "Verify Setup" below</li>
                                  </ol>
                                </div>
                              </div>
                            )}

                            <div className="verification-actions">
                              <button
                                onClick={() => verifyDomain(domain._id, domain.domainName)}
                                className="verify-btn"
                                disabled={isVerifying[domain.domainName]}
                              >
                                {isVerifying[domain.domainName] ? (
                                  <>
                                    <i className="fa-solid fa-spinner fa-spin"></i> Verifying...
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-check"></i> Verify Setup
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {customDomains.length === 0 && !showError && (
            <div className="empty-state">
              <i className="fa-brands fa-cloudflare domain-empty-icon"></i>
              <h3>No Domains Added Yet</h3>
              <p>Add your first Cloudflare domain for automated email routing setup</p>
              <div className="empty-state-tips">
                <div className="tip">
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>Cloudflare manages DNS and email routing automatically</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h2 style={{ color: "white" }}>
              <i className="fa-solid fa-circle-question"></i> Domain Setup FAQ
            </h2>
            <p className="faq-subtitle" style={{ color: "white" }}>
              Learn about Cloudflare integration and nameserver setup
            </p>
          </div>

          <div className="faq-container">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                active={active}
                handleToggle={handleToggle}
                faq={faq}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateDomains;
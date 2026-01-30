import React, { useState, useRef, useEffect } from "react";
import "./PagesCss/Home.css";
import "./PagesCss/Home-MultiEmail.css";
import "./PagesCss/f&q.css";
import "./PagesCss/RealInbox.css";
import gifEmptyInbox from "../assets/Favicon/empty-inbox.gif";
import qrCode from "../assets/Favicon/qr-code.gif";
import domainVerificationService from "../../services/domainVerificationService";
import { emailAPI, subscriptionAPI } from "../../services/api";
import RateLimitModal from "./RateLimitModal";
import EmailInbox from "../EmailInbox/EmailInbox";
import UpgradeModal from "./UpgradeModal";

// Rate Limit Countdown Component
const RateLimitCountdown = ({ resetTime, userPlan, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const reset = new Date(resetTime);
      const diff = reset - now;

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        setIsExpired(true);
        if (onExpire && !isExpired) {
          console.log('Rate limit timer expired');
          onExpire();
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [resetTime, onExpire, isExpired]);

  if (!timeRemaining || isExpired) return null;

  return (
    <div className="rate-limit-warning">
      <div className="rate-limit-warning-content">
        <i className="fa-solid fa-clock"></i>
        <div className="rate-limit-text">
          <strong>Hourly limit reached!</strong>
          <span>You can create more emails after:: <strong>{timeRemaining}</strong></span>
        </div>
      </div>
      {userPlan !== 'Premium' && (
        <div className="rate-limit-action">
          <span className="upgrade-hint">or <a href="/pricing">upgrade your plan</a> for more emails</span>
        </div>
      )}
    </div>
  );
};

const faqs = [
  {
    id: 1,
    header: "What is a Temporary Email?",
    text: "A temporary email is a disposable email address that allows you to receive emails without revealing your personal email address. It's ideal for protecting your privacy while signing up for websites or services that might send unwanted emails or spam.",
  },
  {
    id: 2,
    header: "How long will my Temporary Email last?",
    text: "Your temporary email will last for 10 minutes. After this time, the email address will expire, and you will need to refresh or generate a new one if needed.",
  },
  {
    id: 3,
    header: "How do I view my incoming emails?",
    text: "After generating a temporary email, all incoming messages will appear in your inbox for the duration of the email's validity. Once the email expires, you won't be able to view any further incoming messages unless you refresh or generate a new temporary email.",
  },
  {
    id: 4,
    header: "Can I reply to the emails?",
    text: "No, temporary emails are one-way communication channels only. You can receive emails, but you cannot reply to them. They are designed to protect your personal email from spam and unnecessary exposure.",
  },
  {
    id: 5,
    header: "Is it safe to use a temporary email?",
    text: "Yes, temporary emails help protect your privacy by keeping your real email address hidden. However, avoid using them for critical communications, such as bank accounts or other important services.",
  },
  {
    id: 6,
    header: "How can I delete my temporary email?",
    text: "You can delete your temporary email by clicking the 'Delete' button, which will remove all emails associated with it. If you want to stop using the service, just change or refresh the email.",
  },
  {
    id: 7,
    header: "Can I use this email for verification purposes?",
    text: "Yes, you can use the temporary email for verification or sign-up purposes. However, keep in mind that some websites might block disposable email services, so it may not work for all types of verification.",
  },
  {
    id: 8,
    header: "How do I copy my temporary email?",
    text: "Simply click on the 'Copy' button next to your temporary email address. This will copy it to your clipboard, and you can paste it wherever you need.",
  },
  {
    id: 9,
    header: "What happens when my temporary email expires?",
    text: "Once your temporary email expires after 10 minutes, it will no longer receive incoming messages. You can refresh or generate a new email address to continue using the service.",
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

const Home = () => {
  // State for managing multiple emails with individual timers
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [inbox, setInbox] = useState([
    // {
    //   id: 1,
    //   sender: "example@domain.com",
    //   senderName: "Temp Mail Service",
    //   subject: "Welcome to Temp Mail",
    //   content:
    //     "Thank you for using our temporary email service. This is a welcome email to show you how incoming messages will appear in your inbox. You can safely use this temporary email for all your verification needs without exposing your personal email address.",
    //   timestamp: "10:30 AM, Today",
    //   attachments: [],
    // },
    // {
    //   id: 2,
    //   sender: "no-reply@newsletter.com",
    //   senderName: "Tech Newsletter",
    //   subject: "Get our latest updates",
    //   content:
    //     "Stay updated with the latest technology trends and news. Our newsletter brings you curated content about web development, cybersecurity, and emerging technologies. Click here to learn more about our premium features.",
    //   timestamp: "09:15 AM, Today",
    //   attachments: [],
    // },
    // {
    //   id: 3,
    //   sender: "admin@website.com",
    //   senderName: "Website Admin",
    //   subject: "Your account has been activated",
    //   content:
    //     "Your account registration has been successfully processed and activated. You can now log in and start using all the features available. Please keep this email for your records. If you did not create this account, please contact our support team immediately.",
    //   timestamp: "Yesterday, 3:45 PM",
    //   attachments: [],
    // },
  ]);

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [active, setActive] = useState(null);
  const [copiedEmailId, setCopiedEmailId] = useState(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const [verifiedDomains, setVerifiedDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [customEmailName, setCustomEmailName] = useState("");
  const [customEmailFeedback, setCustomEmailFeedback] = useState("");
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [viewMode, setViewMode] = useState("inbox"); // 'inbox' or 'email-details'

  // Rate limiting states
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitData, setRateLimitData] = useState(null);
  const [userPlan, setUserPlan] = useState('Anonymous');
  const [sessionId, setSessionId] = useState('');
  const [usageStats, setUsageStats] = useState(null);
  const [rateLimitResetTime, setRateLimitResetTime] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Real inbox states
  const [selectedEmailForInbox, setSelectedEmailForInbox] = useState(null);
  const [showRealInbox, setShowRealInbox] = useState(false);
  const [hasActiveEmails, setHasActiveEmails] = useState(true); // Start with true to allow inbox to load

  // Upgrade Modal states for free and anonymous users
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Show upgrade modal 5 seconds after page load (only once per session) for free and anonymous users
  useEffect(() => {
    // Check if this is first visit in this session
    const hasShownUpgradeAd = sessionStorage.getItem('hasShownUpgradeAd');

    // Only show if user is anonymous or free plan (NOT standard or premium)
    const shouldShowUpgradeAd = (userPlan === 'Anonymous' || userPlan === 'Free') && !hasShownUpgradeAd;

    if (shouldShowUpgradeAd) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
        // Mark as shown for this session
        sessionStorage.setItem('hasShownUpgradeAd', 'true');
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [userPlan]);

  // Load verified domains on component mount
  useEffect(() => {
    initializeSession();
    loadUserPlan();
    fetchUsageStats();
    loadVerifiedDomainsFromAPI(); // Load from API instead of localStorage

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      // Reinitialize session when localStorage is cleared
      initializeSession();
      loadUserPlan();
      fetchUsageStats();
      loadVerifiedDomainsFromAPI(); // Reload domains when auth changes

      // Close inbox and clear generated emails
      setShowRealInbox(false);
      setSelectedEmailForInbox(null);
      setGeneratedEmails([]);
      setInbox([]);
      setSelectedEmail(null);
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Load verified domains from backend API
  const loadVerifiedDomainsFromAPI = async () => {
    try {
      const domains = await domainVerificationService.getVerifiedDomainsFromAPI();
      setVerifiedDomains(domains);

      // Set first verified domain as selected if none selected
      if (domains.length > 0 && !selectedDomain) {
        setSelectedDomain(domains[0].domain);
      }

      console.log('Loaded verified domains from API:', domains);
    } catch (error) {
      console.error('Failed to load verified domains:', error);
      setVerifiedDomains([]); // Clear domains on error
    }
  };


  // Load active emails after userPlan is loaded
  useEffect(() => {
    if (userPlan && sessionId) {
      loadActiveEmails();
      // Also check rate limit status on load
      checkInitialRateLimit();
    }
  }, [userPlan, sessionId]);

  // Check initial rate limit status (on page load)
  const checkInitialRateLimit = async () => {
    try {
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.checkRateLimit(sid);

      if (!response.data.allowed && response.data.resetTime) {
        setRateLimitResetTime(response.data.resetTime);
        setIsRateLimited(true);
        console.log('User is currently rate limited until:', response.data.resetTime);
      }
    } catch (error) {
      // Silently fail on initial check if backend is not available
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('⚠️ Backend server is not running. Rate limiting will not work until backend is started.');
      } else {
        console.error('Failed to check initial rate limit:', error);
      }
    }
  };

  // Check rate limit status every minute and clear when expired
  useEffect(() => {
    const checkRateLimitStatus = () => {
      if (rateLimitResetTime) {
        const now = new Date();
        const resetTime = new Date(rateLimitResetTime);

        if (now >= resetTime) {
          // Rate limit has expired
          setIsRateLimited(false);
          setRateLimitResetTime(null);
          console.log('Rate limit expired, user can generate emails again');
        }
      }
    };

    // Check immediately
    checkRateLimitStatus();

    // Check every 10 seconds
    const interval = setInterval(checkRateLimitStatus, 10000);

    return () => clearInterval(interval);
  }, [rateLimitResetTime]);

  // Initialize session for anonymous users
  const initializeSession = () => {
    let sid = localStorage.getItem('tempmail_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tempmail_session_id', sid);
    }
    setSessionId(sid);
    return sid; // Return the session ID
  };

  // Load user plan if authenticated
  const loadUserPlan = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await subscriptionAPI.getMySubscription();
        const newPlan = response.data.currentPlan;
        setUserPlan(newPlan);
        console.log('User plan loaded:', newPlan);
      } else {
        setUserPlan('Anonymous');
      }
    } catch (error) {
      console.error('Failed to load user plan:', error);
      setUserPlan('Anonymous');
    }
  };

  // Force refresh user plan and stats (call this after plan upgrades)
  const refreshUserPlanAndStats = async () => {
    await loadUserPlan();
    await fetchUsageStats();
    showNotification('Plan updated successfully!', 'success');
  };

  // Expose refresh function globally for use after plan upgrades
  useEffect(() => {
    window.refreshUserPlanAndStats = refreshUserPlanAndStats;
    return () => {
      delete window.refreshUserPlanAndStats;
    };
  }, []);

  // Fetch usage stats
  const fetchUsageStats = async () => {
    try {
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.getUsageStats(sid);
      setUsageStats(response.data);
      console.log('Usage stats:', response.data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  // Load active emails from database
  const loadActiveEmails = async () => {
    try {
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.getActiveEmails(sid);

      if (response.success && response.data) {
        // Convert database emails to component state format
        const emails = response.data.map(email => {
          const expiresAt = new Date(email.expiresAt);
          const now = new Date();
          const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

          return {
            id: email._id,
            email: email.emailAddress,
            validity: remainingSeconds,
            createdAt: new Date(email.createdAt).toLocaleTimeString()
          };
        });

        setGeneratedEmails(emails);
        console.log(`Loaded ${emails.length} active emails from database`);

        // Auto-show inbox for the first email if not already showing
        if (emails.length > 0 && !showRealInbox && !selectedEmailForInbox) {
          setSelectedEmailForInbox(emails[0].email);
          setShowRealInbox(true);
          setHasActiveEmails(true);
          console.log('Auto-selected first email for inbox:', emails[0].email);
        }
      }
    } catch (error) {
      console.error('Failed to load active emails:', error);
    }
  };

  // Show toast notification
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Check rate limit before generating email
  const checkRateLimitBeforeGenerate = async () => {
    try {
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.checkRateLimit(sid);

      if (!response.data.allowed) {
        // Only set reset time if it's not already set or if the new one is earlier
        // This prevents resetting the timer on multiple clicks
        const newResetTime = new Date(response.data.resetTime);
        const currentResetTime = rateLimitResetTime ? new Date(rateLimitResetTime) : null;

        if (!currentResetTime || newResetTime.getTime() !== currentResetTime.getTime()) {
          setRateLimitResetTime(response.data.resetTime);
          console.log('Rate limit reset time set to:', response.data.resetTime);
        }

        setIsRateLimited(true);
        setRateLimitData(response.data);
        setShowRateLimitModal(true);

        // Show appropriate error message only on first hit
        if (!currentResetTime) {
          if (response.data.requiresAuth) {
            showNotification('You\'ve reached your limit of 2 emails. Wait 1 hour or create an account for more!', 'error');
          } else if (response.data.requiresUpgrade) {
            showNotification(`You've used all ${response.data.currentLimit} emails. Wait for reset or upgrade your plan.`, 'error');
          }
        }

        return false;
      }

      // No rate limit - clear any existing limit
      setIsRateLimited(false);
      setRateLimitResetTime(null);
      return true;
    } catch (error) {
      // Check if it's a network error (backend not running)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('⚠️ Backend server is not running. Please start the backend on port 8080.');
        showNotification('Cannot connect to server. Please make sure the backend is running.', 'error');
      } else {
        console.error('Rate limit check failed:', error);
        showNotification('Failed to check rate limit. Please try again.', 'error');
      }
      return false;
    }
  };

  // Timer countdown effect for all generated emails
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGeneratedEmails((prevEmails) =>
        prevEmails.map((email) => {
          if (email.validity > 0) {
            return { ...email, validity: email.validity - 1 };
          }
          return email;
        }).filter((email) => email.validity > 0) // Remove expired emails
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Get total expiry duration in seconds based on plan
  const getExpiryDurationSeconds = (plan) => {
    switch (plan) {
      case 'Anonymous':
      case 'Free':
        return 10 * 60; // 10 minutes
      case 'Standard':
        return 12 * 60 * 60; // 12 hours
      case 'Premium':
        return 24 * 60 * 60; // 24 hours
      default:
        return 10 * 60; // Default to 10 minutes
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`;
    }
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const copyEmail = (emailAddress, emailId) => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmailId(emailId);
    showNotification('Email copied to clipboard!', 'success');
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Get generation limit based on user plan
  const getGenerationLimit = () => {
    const limits = {
      'Anonymous': 2,
      'Free': 5,
      'Standard': 10,
      'Premium': 15
    };
    return limits[userPlan] || 2;
  };

  // Generate new email and add to list
  const generateEmail = async () => {
    // Prevent multiple simultaneous clicks
    if (isGenerating) return;

    // Show upgrade modal for free and anonymous users (but still proceed with generation)
    if (userPlan === 'Anonymous' || userPlan === 'Free') {
      setShowUpgradeModal(true);
    }

    setIsGenerating(true);

    try {
      // Check hourly rate limit (database tracked - enforces 1 hour window)
      const rateLimitCheck = await checkRateLimitBeforeGenerate();
      if (!rateLimitCheck) {
        setIsGenerating(false);
        return;
      }
      // Don't specify domain - let backend choose randomly from available domains
      const domain = null;

      // Create email via API (will be saved to database)
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.create(null, domain, sid);

      if (response.success) {
        const emailData = response.data;

        // Calculate remaining time from expiresAt
        const expiresAt = new Date(emailData.expiresAt);
        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

        const emailObject = {
          id: emailData.id,
          email: emailData.email,
          validity: remainingSeconds,
          createdAt: new Date(emailData.createdAt).toLocaleTimeString()
        };

        setGeneratedEmails((prev) => [emailObject, ...prev]);
        setCustomEmailName("");
        setShowCustomEmailInput(false);

        // Auto-select the newly generated email in the inbox
        setSelectedEmailForInbox(emailData.email);
        setShowRealInbox(true);
        setHasActiveEmails(true);

        // Show success notification
        showNotification('Email generated and saved successfully!', 'success');

        // Check if user just hit their limit - if so, automatically start timer AND show modal
        if (response.rateLimit && !response.rateLimit.allowed) {
          setRateLimitResetTime(response.rateLimit.resetTime);
          setIsRateLimited(true);
          setRateLimitData(response.rateLimit);
          setShowRateLimitModal(true); // Show modal immediately when limit is reached
          console.log('Limit reached! Timer started and modal shown automatically. Reset at:', response.rateLimit.resetTime);

          // Show informative notification
          if (response.rateLimit.requiresAuth) {
            showNotification(`You've used all ${response.rateLimit.currentLimit} emails. Create an account for more!`, 'info');
          } else if (response.rateLimit.requiresUpgrade) {
            showNotification(`You've used all ${response.rateLimit.currentLimit} emails. Timer started!`, 'info');
          }
        }

        // Update usage stats
        await fetchUsageStats();
      }
    } catch (error) {
      console.error('Failed to generate email:', error);
      showNotification(error.response?.data?.message || 'Failed to generate email. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete a single generated email
  const deleteGeneratedEmail = (emailId) => {
    setGeneratedEmails((prev) => prev.filter((email) => email.id !== emailId));
    showNotification('Email deleted successfully!', 'success');
  };

  // Delete all generated emails
  const deleteAllGeneratedEmails = () => {
    setGeneratedEmails([]);
    showNotification('All emails deleted successfully!', 'success');
  };

  const deleteEmail = () => {
    setInbox([]);
    if (viewMode === "email-details") {
      setViewMode("inbox");
      setSelectedEmail(null);
    }
    showNotification('All emails deleted successfully!', 'success');
  };

  const deleteSingleEmail = (id) => {
    setInbox(inbox.filter((email) => email.id !== id));
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(null);
      setViewMode("inbox");
    }
    showNotification('Email deleted successfully!', 'success');
  };

  const handleToggle = (id) => {
    setActive(active === id ? null : id);
  };

  const openEmailDetails = (email) => {
    setSelectedEmail(email);
    setViewMode("email-details");
  };

  const goBackToInbox = () => {
    setViewMode("inbox");
    setSelectedEmail(null);
  };

  const handleDomainSelect = async (domain) => {
    // Check hourly rate limit (database tracked - enforces 1 hour window)
    const rateLimitCheck = await checkRateLimitBeforeGenerate();
    if (!rateLimitCheck) return;

    try {
      setSelectedDomain(domain);

      // Create email via API with selected domain
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.create(null, domain, sid);

      if (response.success) {
        const emailData = response.data;

        // Calculate remaining time from expiresAt
        const expiresAt = new Date(emailData.expiresAt);
        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

        const emailObject = {
          id: emailData.id,
          email: emailData.email,
          validity: remainingSeconds,
          createdAt: new Date(emailData.createdAt).toLocaleTimeString()
        };

        setGeneratedEmails((prev) => [emailObject, ...prev]);
        setCustomEmailName("");
        setShowCustomEmailInput(false);
        setShowDomainDropdown(false);

        // Auto-select the newly generated email in the inbox
        setSelectedEmailForInbox(emailData.email);
        setShowRealInbox(true);
        setHasActiveEmails(true);

        showNotification('Email generated with selected domain!', 'success');

        // Check if user just hit their limit - if so, automatically start timer AND show modal
        if (response.rateLimit && !response.rateLimit.allowed) {
          setRateLimitResetTime(response.rateLimit.resetTime);
          setIsRateLimited(true);
          setRateLimitData(response.rateLimit);
          setShowRateLimitModal(true); // Show modal immediately when limit is reached
          console.log('Limit reached! Timer started and modal shown automatically. Reset at:', response.rateLimit.resetTime);

          // Show informative notification
          if (response.rateLimit.requiresAuth) {
            showNotification(`You've used all ${response.rateLimit.currentLimit} emails. Create an account for more!`, 'info');
          } else if (response.rateLimit.requiresUpgrade) {
            showNotification(`You've used all ${response.rateLimit.currentLimit} emails. Timer started!`, 'info');
          }
        }

        // Update usage stats
        await fetchUsageStats();
      }
    } catch (error) {
      console.error('Failed to generate email with domain:', error);
      showNotification(error.response?.data?.message || 'Failed to generate email', 'error');
    }
  };

  const quickUseDomain = (domain, e) => {
    e.stopPropagation();

    // Select the domain in Custom Email section
    setSelectedDomain(domain);

    // Open the custom email input if not already open
    setShowCustomEmailInput(true);

    // Scroll to custom email section smoothly
    setTimeout(() => {
      const customEmailSection = document.querySelector('.custom-email-section');
      if (customEmailSection) {
        customEmailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    showNotification(`Domain @${domain} selected! Enter your custom email name.`, 'success');
  };

  const toggleCustomEmailInput = () => {
    setShowCustomEmailInput(!showCustomEmailInput);
    setCustomEmailName("");
    setCustomEmailFeedback("");
    setShowDomainDropdown(false);
  };

  const handleCustomEmailSubmit = async () => {
    if (!customEmailName.trim()) {
      setCustomEmailFeedback("Please enter a username for your custom email");
      showNotification("Please enter a username for your custom email", "error");
      return;
    }

    // Validate custom email name
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(customEmailName)) {
      const msg = "Username can only contain letters, numbers, dots, hyphens, and underscores";
      setCustomEmailFeedback(msg);
      showNotification(msg, "error");
      return;
    }

    if (customEmailName.length < 3) {
      const msg = "Username must be at least 3 characters long";
      setCustomEmailFeedback(msg);
      showNotification(msg, "error");
      return;
    }

    if (customEmailName.length > 30) {
      const msg = "Username cannot exceed 30 characters";
      setCustomEmailFeedback(msg);
      showNotification(msg, "error");
      return;
    }

    if (!selectedDomain) {
      const msg = "Please select a domain first";
      setCustomEmailFeedback(msg);
      showNotification(msg, "error");
      return;
    }

    // Check hourly rate limit (database tracked - enforces 1 hour window)
    const rateLimitCheck = await checkRateLimitBeforeGenerate();
    if (!rateLimitCheck) return;

    try {
      // Create custom email via API (will be saved to database)
      const sid = localStorage.getItem('tempmail_session_id') || sessionId;
      const response = await emailAPI.create(customEmailName, selectedDomain, sid);

      if (response.success) {
        const emailData = response.data;

        // Calculate remaining time from expiresAt
        const expiresAt = new Date(emailData.expiresAt);
        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

        const emailObject = {
          id: emailData.id,
          email: emailData.email,
          validity: remainingSeconds,
          createdAt: new Date(emailData.createdAt).toLocaleTimeString()
        };

        setGeneratedEmails((prev) => [emailObject, ...prev]);
        setCustomEmailFeedback(`Custom email created: ${emailData.email}`);

        // Auto-select the newly generated email in the inbox
        setSelectedEmailForInbox(emailData.email);
        setShowRealInbox(true);
        setHasActiveEmails(true);

        showNotification(`Custom email created: ${emailData.email}`, "success");

        // Check if user just hit their limit - if so, automatically start timer AND show modal
        if (response.rateLimit && !response.rateLimit.allowed) {
          setRateLimitResetTime(response.rateLimit.resetTime);
          setIsRateLimited(true);
          setRateLimitData(response.rateLimit);
          setShowRateLimitModal(true); // Show modal immediately when limit is reached
          console.log('Limit reached! Timer started and modal shown automatically. Reset at:', response.rateLimit.resetTime);

          // Show informative notification
          if (response.rateLimit.requiresAuth) {
            showNotification(`You've used all ${response.rateLimit.currentLimit} emails. Create an account for more!`, 'info');
          } else if (response.rateLimit.requiresUpgrade) {
            showNotification(`You've used all ${response.rateLimit.currentLimit} emails. Timer started!`, 'info');
          }
        }

        // Update usage stats
        await fetchUsageStats();

        setTimeout(() => {
          setCustomEmailFeedback("");
          setShowCustomEmailInput(false);
          setCustomEmailName("");
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to create custom email:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create custom email';
      setCustomEmailFeedback(errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  const handleCustomEmailKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCustomEmailSubmit();
    }
  };

  const toggleDomainDropdown = () => {
    setShowDomainDropdown(!showDomainDropdown);
  };

  const handleDomainSelectFromDropdown = (domain) => {
    setSelectedDomain(domain);
    setShowDomainDropdown(false);
  };

  return (
    <div className="home-page">
      {/* Rate Limit Modal */}
      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        rateLimitData={rateLimitData}
        userPlan={userPlan}
      />

      {/* Upgrade Modal for Free and Anonymous Users */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Premium Plans"
      />

      {/* Main Content */}
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            <span className="highlight">Secure</span> Temporary Email Service
          </h1>
          <p className="hero-subtitle">
            Protect your privacy with disposable email addresses that keep your
            inbox clean and secure
          </p>
        </div>

        {/* Email Section */}
        <div className="email-section">
          <div className="email-header">
            <h2>Generate Temporary Email Addresses</h2>
            <div className="email-stats-info">
              <span className="user-plan-badge">
                <i className="fa-solid fa-user"></i>
                {userPlan} Plan
              </span>
              <span className="emails-generated">
                <i className="fa-solid fa-list"></i>
                {usageStats?.hourlyUsed || 0} / {getGenerationLimit()} emails generated
              </span>
            </div>
          </div>

          {/* Generate Email Button */}
          <div className="generate-email-container">
            <button
              className="button btn-generate-email"
              onClick={generateEmail}
              disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.6 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}
            >
              <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-plus-circle'}`}></i> {isGenerating ? 'Generating...' : 'Generate Email'}
            </button>

            {/* Rate Limit Warning with Timer */}
            {isRateLimited && rateLimitResetTime && (
              <RateLimitCountdown
                resetTime={rateLimitResetTime}
                userPlan={userPlan}
                onExpire={() => {
                  console.log('Rate limit expired - resetting state');
                  setIsRateLimited(false);
                  setRateLimitResetTime(null);
                  setShowRateLimitModal(false);
                  setRateLimitData(null);
                }}
              />
            )}
          </div>

          {/* Generated Emails List */}
          {generatedEmails.length > 0 ? (
            <div className="generated-emails-list">
              <div className="list-header">
                <h3>
                  <i className="fa-solid fa-envelope-open-text"></i>
                  Your Generated Emails
                </h3>
              </div>

              <div className="emails-scroll-container">
                {generatedEmails.map((emailItem) => (
                  <div key={emailItem.id} className="email-item-card">
                    <div className="email-item-header">
                      <div className="email-item-info">
                        <div className="email-address-display">
                          <i className="fa-solid fa-envelope"></i>
                          <span className="email-text">{emailItem.email}</span>
                        </div>
                        <span className="email-created-time">
                          <i className="fa-solid fa-clock"></i>
                          Created: {emailItem.createdAt}
                        </span>
                      </div>
                      <div className="email-item-actions">
                        <button
                          className="view-inbox-btn"
                          onClick={() => {
                            setSelectedEmailForInbox(emailItem.email);
                            setShowRealInbox(true);
                            setHasActiveEmails(true);
                          }}
                          title="View Inbox"
                        >
                          <i className="fa-solid fa-inbox"></i>
                          View Inbox
                        </button>
                        <button
                          className={`copy-btn ${copiedEmailId === emailItem.id ? "copied" : ""}`}
                          onClick={() => copyEmail(emailItem.email, emailItem.id)}
                        >
                          <i className={`fa-solid ${copiedEmailId === emailItem.id ? "fa-check" : "fa-copy"}`}></i>
                          {copiedEmailId === emailItem.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div className="email-timer-section">
                      <div className="timer-info">
                        <i className="fa-solid fa-hourglass-half"></i>
                        <span className="timer-label">Expires in:</span>
                        <span className="timer-value">{formatTime(emailItem.validity)}</span>
                      </div>
                      <div className="timer-progress-bar">
                        <div
                          className="timer-progress-fill"
                          style={{
                            width: `${(emailItem.validity / getExpiryDurationSeconds(userPlan)) * 100}%`,
                            backgroundColor: emailItem.validity < 120 ? '#f44336' : emailItem.validity < 300 ? '#ff9800' : '#4CAF50'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-emails-generated">
              <div className="empty-state-icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h3>No Emails Generated Yet</h3>
              <p>Click "Generate Email" to create your first temporary email address</p>
            </div>
          )}

          {/* Custom Email Creation Section */}
          {verifiedDomains.length > 0 && selectedDomain && (
            <div className="custom-email-section">
              <div className="custom-email-header">
                <h3>
                  <i className="fa-solid fa-user-edit"></i>
                  Create Custom Email
                </h3>
                <button
                  className="toggle-custom-email-btn"
                  onClick={toggleCustomEmailInput}
                >
                  <i
                    className={`fa-solid fa-${showCustomEmailInput ? "minus" : "plus"
                      }`}
                  ></i>
                  {showCustomEmailInput ? "Hide" : "Create Custom Email"}
                </button>
              </div>

              {showCustomEmailInput && (
                <div className="custom-email-input-container">
                  <div className="custom-email-input-group">
                    <input
                      type="text"
                      className="custom-email-input"
                      placeholder="Enter username (e.g., john.doe)"
                      value={customEmailName}
                      onChange={(e) => setCustomEmailName(e.target.value)}
                      onKeyPress={handleCustomEmailKeyPress}
                    />

                    {/* Domain Dropdown */}
                    <div className="custom-email-domain-dropdown">
                      <button
                        className="domain-dropdown-toggle"
                        onClick={toggleDomainDropdown}
                        type="button"
                      >
                        <span className="domain-selected">
                          @{selectedDomain}
                        </span>
                        <i
                          className={`fa-solid fa-chevron-${showDomainDropdown ? "up" : "down"
                            }`}
                        ></i>
                      </button>

                      {showDomainDropdown && (
                        <div className="domain-dropdown-menu">
                          {verifiedDomains.length > 0 ? (
                            verifiedDomains.map((domain) => (
                              <button
                                key={domain.id}
                                className={`domain-dropdown-item ${selectedDomain === domain.domain ? "active" : ""
                                  }`}
                                onClick={() =>
                                  handleDomainSelectFromDropdown(domain.domain)
                                }
                              >
                                <i className="fa-solid fa-shield-check" style={{ color: '#10b981' }}></i>
                                <span>@{domain.domain}</span>
                                {selectedDomain === domain.domain && (
                                  <i className="fa-solid fa-check"></i>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="no-domains-message">
                              <i className="fa-solid fa-info-circle"></i>
                              <span>No verified domains. Go to Private Domains to add and verify your domain.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      className="create-custom-email-btn"
                      onClick={handleCustomEmailSubmit}
                    >
                      <i className="fa-solid fa-check"></i>
                      Create
                    </button>
                  </div>

                  {customEmailFeedback && (
                    <div
                      className={`custom-email-feedback ${customEmailFeedback.includes("created")
                        ? "success"
                        : "error"
                        }`}
                    >
                      <i
                        className={`fa-solid ${customEmailFeedback.includes("created")
                          ? "fa-check-circle"
                          : "fa-exclamation-circle"
                          }`}
                      ></i>
                      <span>{customEmailFeedback}</span>
                    </div>
                  )}

                  <div className="custom-email-tips">
                    <div className="tip">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span>
                        Username can contain letters, numbers, dots, hyphens,
                        and underscores
                      </span>
                    </div>
                    <div className="tip">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span>Must be 3-30 characters long</span>
                    </div>
                    <div className="tip">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span>
                        Select your preferred domain from the dropdown
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verified Domains Section */}
          {verifiedDomains.length > 0 && (
            <div className="verified-domains-section">
              <div className="verified-domains-header">
                <h3>
                  <i className="fa-solid fa-shield-check"></i>
                  Your Verified Domains
                </h3>
                <span className="domains-count">
                  {verifiedDomains.length} domains
                </span>
              </div>

              <div className="domains-grid-home">
                {verifiedDomains.map((domain, index) => (
                  <div
                    key={domain.id}
                    className={`domain-item ${selectedDomain === domain.domain ? "selected" : ""
                      }`}
                  >
                    <div className="domain-item-header">
                      <div className="domain-icon-container">
                        <i className="fa-solid fa-globe"></i>
                      </div>
                      <div className="domain-info">
                        <h4>{domain.domain}</h4>
                        <p className="domain-status">
                          <i className="fa-solid fa-check-circle"></i>
                          Verified
                        </p>
                      </div>
                    </div>
                    <div className="domain-item-footer">
                      <span className="domain-expiry">
                        Expires:{" "}
                        {domain.expiresAt
                          ? new Date(domain.expiresAt).toLocaleDateString()
                          : 'Never'}
                      </span>
                      <button
                        className="use-domain-btn"
                        onClick={(e) => quickUseDomain(domain.domain, e)}
                      >
                        <i className="fa-solid fa-bolt"></i>
                        Quick Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="description">
            <strong>
              Say goodbye to spam, unsolicited marketing, and potential security
              threats.
            </strong>
            With Temp-MailHub, you can keep your personal inbox clean, secure,
            and free from unwanted emails.
          </p>

          <div className="email-stats">
            <div className="stat-item">
              <i className="fa-solid fa-shield-halved"></i>
              <div>
                <h4>100% Anonymous</h4>
                <p>No personal data required</p>
              </div>
            </div>
            <div className="stat-item">
              <i className="fa-solid fa-bolt"></i>
              <div>
                <h4>Instant Access</h4>
                <p>No registration needed</p>
              </div>
            </div>
            <div className="stat-item">
              <i className="fa-solid fa-infinity"></i>
              <div>
                <h4>Multiple Emails</h4>
                <p>Generate multiple emails based on your plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Inbox & Email Details Section */}
        <div className="email-content-section">
          {showRealInbox && selectedEmailForInbox && hasActiveEmails ? (
            <div className="unified-inbox-section">
              <div className="inbox-header" style={{ background: 'linear-gradient(135deg, #16423c, #2a5b52)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ color: 'white', margin: '0', textAlign: 'center' }}>Email Inbox</h2>

                {/* Email Address Display with Copy Button */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <i className="fa-solid fa-envelope" style={{ color: 'white', fontSize: '20px', flexShrink: 0 }}></i>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', fontWeight: '500' }}>
                        Current Email:
                      </span>
                      <span style={{ color: 'white', fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedEmailForInbox}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyEmail(selectedEmailForInbox, 'inbox-email')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <i className={`fa-solid ${copiedEmailId === 'inbox-email' ? 'fa-check' : 'fa-copy'}`}></i>
                    {copiedEmailId === 'inbox-email' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="real-inbox-container">
                <EmailInbox
                  emailAddress={selectedEmailForInbox}
                  userPlan={userPlan}
                  onEmailChange={(newEmail) => {
                    setSelectedEmailForInbox(newEmail);
                    console.log('Switched to inbox:', newEmail);
                  }}
                  onEmailCountChange={(count) => {
                    setHasActiveEmails(count > 0);
                    if (count === 0) {
                      console.log('All emails expired, hiding inbox');
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="unified-inbox-section">
              {/* Header with Back Button and Title */}
              <div className="inbox-header" style={{ background: 'linear-gradient(135deg, #16423c, #2a5b52)' }}
              >
                <div className="inbox-title">
                  {viewMode === "email-details" ? (
                    <button className="back-to-inbox-btn" onClick={goBackToInbox}>
                      <i className="fa-solid fa-arrow-left"></i> Back to Inbox
                    </button>
                  ) : (
                    <>
                      <i className="fa-solid fa-inbox"></i>
                      <h2>Inbox</h2>
                      <span className="email-count" style={{ color: 'white' }}>{inbox.length} emails</span>
                    </>
                  )}
                </div>

                {viewMode === "inbox" && (
                  <button
                    className="refresh-inbox"
                    onClick={() => alert("Inbox refreshed!")}
                    style={{ color: 'white' }}>
                    <i className="fa-solid fa-sync-alt"></i> Refresh
                  </button>
                )}
              </div>

              {/* Content Area */}
              <div className="unified-inbox-content">
                {viewMode === "inbox" ? (
                  <>
                    {/* Inbox List View */}
                    <div className="inbox-header-row">
                      <span className="header-item">
                        <i className="fa-solid fa-user"></i> Sender
                      </span>
                      <span className="header-item">
                        <i className="fa-solid fa-file-alt"></i> Subject
                      </span>
                      <span className="header-item">
                        <i className="fa-solid fa-clock"></i> Time
                      </span>
                      <span className="header-item">
                        <i className="fa-solid fa-eye"></i> View
                      </span>
                    </div>

                    <div className="inbox-content">
                      {inbox.length === 0 ? (
                        <div className="empty-inbox-container">
                          <div className="empty-inbox-animation">
                            <img
                              src={gifEmptyInbox}
                              alt="Empty inbox"
                              className="empty-inbox-gif"
                            />
                            <div className="pulse-ring"></div>
                          </div>
                          <h3 className="empty-inbox-title">Your Inbox is Empty</h3>
                          <p className="empty-inbox-subtitle">
                            Waiting for incoming emails...
                          </p>
                        </div>
                      ) : (
                        inbox.map((mail) => (
                          <div
                            className="inbox-item"
                            key={mail.id}
                          >
                            <div className="sender-info">
                              <div className="sender-avatar">
                                <i className="fa-solid fa-user-circle"></i>
                              </div>
                              <div className="sender-details">
                                <span className="sender-name" style={{ color: 'white' }}>{mail.senderName}</span>
                                <span className="sender-email" style={{ color: 'white' }}>{mail.sender}</span>
                              </div>
                            </div>
                            <span className="email-subject">{mail.subject}</span>
                            <span className="email-time" style={{ color: 'white' }}>{mail.timestamp}</span>
                            <div className="email-actions">
                              <button
                                className="view-button"
                                onClick={() => openEmailDetails(mail)}
                              >
                                <i className="fa-solid fa-eye"></i> View
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Email Details View */}
                    {selectedEmail ? (
                      <div className="email-details-container">
                        <div className="email-details-header">
                          <h3>{selectedEmail.subject}</h3>
                        </div>
                        <div className="email-details-body">
                          <div className="email-sender-info">
                            <div className="sender-avatar">
                              <i className="fa-solid fa-user-circle"></i>
                            </div>
                            <div className="sender-details">
                              <h4>{selectedEmail.senderName}</h4>
                              <p className="sender-email" style={{ color: 'white' }}>{selectedEmail.sender}</p>
                              <p className="email-time" style={{ color: 'white' }}>{selectedEmail.timestamp}</p>
                            </div>
                          </div>
                          <div className="email-content">
                            <p>{selectedEmail.content}</p>
                          </div>
                          {selectedEmail.attachments &&
                            selectedEmail.attachments.length > 0 && (
                              <div className="email-attachments">
                                <h5>
                                  <i className="fa-solid fa-paperclip"></i> Attachments
                                </h5>
                                <div className="attachments-list">
                                  {selectedEmail.attachments.map(
                                    (attachment, index) => (
                                      <div key={index} className="attachment-item">
                                        <i className="fa-solid fa-file"></i>
                                        <span>{attachment.name}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="email-details-footer">
                          <button
                            className="btn-secondary"
                            onClick={() => deleteSingleEmail(selectedEmail.id)}
                          >
                            <i className="fa-solid fa-trash"></i> Delete Email
                          </button>

                        </div>
                      </div>
                    ) : (
                      <div className="no-email-selected">
                        <i className="fa-solid fa-envelope-open-text"></i>
                        <h3>No email selected</h3>
                        <p>Please select an email to view details</p>
                        <button className="btn-primary" onClick={goBackToInbox}>
                          <i className="fa-solid fa-arrow-left"></i> Back to Inbox
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">Why Choose Temp-MailHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <h3>Privacy Protection</h3>
              <p>
                Keep your personal email address private and avoid spam and
                tracking
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-mobile-screen"></i>
              </div>
              <h3>Mobile Friendly</h3>
              <p>Works perfectly on all devices and screen sizes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h3>Fast & Free</h3>
              <p>No registration required, instant email generation</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <h2 className="section-title" style={{ color: "white" }}>
              <i
                className="fa-solid fa-circle-question"
                style={{ color: "white" }}
              ></i>
              Frequently Asked Questions
            </h2>
            <p className="section-subtitle" style={{ color: "white" }}>
              Quick answers to common questions
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

export default Home;
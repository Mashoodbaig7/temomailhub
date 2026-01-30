import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { subscriptionAPI } from "../../services/api";
import "./PagesCss/Profile.css";


const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      toast.error('Please login to view subscription details');
      navigate('/sign');
      return;
    }

    loadSubscription();
    loadUsageStats();
  }, [navigate]);

  // Load subscription data from API
  const loadSubscription = async () => {
      try {
        setIsLoadingSubscription(true);
        const response = await subscriptionAPI.getMySubscription();
  
        if (response.success) {
          const subData = response.data;
  
          // Map plan features to display
          const planFeatures = {
            'Free': [
              '5 temporary emails per hour',
              '10-minute email lifespan',
              'Basic spam filtering',
              'Standard support'
            ],
            'Standard': [
              '20 temporary emails per hour',
              '12-hour email lifespan',
              '1MB attachment support',
              'Ad-free experience',
              'Priority support',
              '20 email inbox storage',
              'Custom domain support'
            ],
            'Premium': [
              'Unlimited temporary emails',
              '24-hour email lifespan',
              '10MB attachment support',
              'Custom domain support',
              'Ad-free experience',
              'Priority support',
              'Advanced spam filtering',
              '100 email inbox storage'
            ]
          };
  
          // Calculate next billing date
          const nextBilling = subData.subscriptionEndDate
            ? new Date(subData.subscriptionEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'N/A';
  
          // Get plan price
          const planPrices = {
            'Free': 0,
            'Standard': 9.99,
            'Premium': 19.99
          };
  
          setSubscription({
            plan: subData.currentPlan,
            price: planPrices[subData.currentPlan] || 0,
            status: subData.accountStatus.toLowerCase(),
            nextBillingDate: nextBilling,
            renewalType: subData.billingCycle || 'monthly',
            features: planFeatures[subData.currentPlan] || planFeatures['Free'],
            autoRenew: subData.autoRenew,
            paymentStatus: subData.paymentStatus,
            paymentMethod: subData.paymentMethod || 'N/A'
          });
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        // Set default free plan on error
        setSubscription({
          plan: 'Free',
          price: 0,
          status: 'active',
          nextBillingDate: 'N/A',
          renewalType: 'monthly',
          features: [
            '5 temporary emails per hour',
            '10-minute email lifespan',
            'Basic spam filtering',
            'Standard support'
          ],
          autoRenew: false,
          paymentStatus: 'Free',
          paymentMethod: 'N/A'
        });
      } finally {
        setIsLoadingSubscription(false);
      }
    };
  // Load usage statistics
  const loadUsageStats = async () => {
    try {
      setIsLoadingUsage(true);
      
      const response = await subscriptionAPI.getMySubscription();

      if (response.success && response.data) {
        // Extract usage stats from subscription data
        const stats = {
          hourlyUsed: response.data.emailsGeneratedToday || 0,
          hourlyLimit: response.data.planFeatures?.emailLimit || 5,
          storageUsed: response.data.inboxStorageUsed || 0,
          storageLimit: response.data.planFeatures?.inboxStorage || 0,
          domainsUsed: response.data.domainsAddedThisMonth || 0,
          domainsLimit: response.data.planFeatures?.domainsPerMonth || 0,
          customEmailsUsed: response.data.customEmailsCreatedThisMonth || 0,
          customEmailsLimit: response.data.planFeatures?.customEmailsPerMonth || 0,
        };
        setUsageStats(stats);
      } else if (response.data) {
        const stats = {
          hourlyUsed: response.data.emailsGeneratedToday || 0,
          hourlyLimit: response.data.planFeatures?.emailLimit || 5,
          storageUsed: response.data.inboxStorageUsed || 0,
          storageLimit: response.data.planFeatures?.inboxStorage || 0,
          domainsUsed: response.data.domainsAddedThisMonth || 0,
          domainsLimit: response.data.planFeatures?.domainsPerMonth || 0,
          customEmailsUsed: response.data.customEmailsCreatedThisMonth || 0,
          customEmailsLimit: response.data.planFeatures?.customEmailsPerMonth || 0,
        };
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('❌ [Usage Stats] Error loading usage stats:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#4CAF50";
      case "inactive":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const handleUpgradePlan = () => {
    navigate('/pricing');
  };

  if (isLoadingSubscription) {
    return (
      <div className="subscription-management-container">
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#16423C' }}></i>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
   <div className="content-card"  style={{  margin: "55px" }}>
  {isLoadingSubscription ? (
    <div className="loading-subscription">
      <i
        className="fa-solid fa-spinner fa-spin"
        style={{ fontSize: "32px", color: "#16423C" }}
      ></i>
      <p>Loading subscription details...</p>
    </div>
  ) : subscription ? (
    <>
      <div className="card-header">
        <h3>
          <i className="fa-solid fa-crown"></i> Subscription Management
        </h3>
        <div
          className="status-badge"
          style={{
            backgroundColor: getStatusColor(subscription.status),
          }}
        >
          {subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1)}
        </div>
      </div>

      <div className="subscription-details">
        {/* Usage Statistics Section */}
        {!isLoadingUsage && usageStats && (
          <div className="usage-stats-card">
            <div className="stats-header">
              <h4>
                <i className="fa-solid fa-chart-line"></i> Usage Statistics
              </h4>
            </div>

            <div className="stats-grid">
              {/* Email Generation Stats */}
              <div className="stat-item">
                <div className="stat-icon email-icon">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Emails This Hour</span>
                  <div className="stat-value-wrapper">
                    <span className="stat-value">
                      {usageStats.hourlyUsed || 0}
                    </span>
                    <span className="stat-limit">
                      / {usageStats.hourlyLimit || 0}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          usageStats.hourlyLimit > 0
                            ? (usageStats.hourlyUsed /
                                usageStats.hourlyLimit) *
                              100
                            : 0
                        }%`,
                        backgroundColor:
                          usageStats.hourlyUsed >= usageStats.hourlyLimit
                            ? "#f44336"
                            : "#4CAF50",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Remaining Emails */}
              <div className="stat-item">
                <div className="stat-icon remaining-icon">
                  <i className="fa-solid fa-hourglass-half"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Remaining This Hour</span>
                  <div className="stat-value-wrapper">
                    <span className="stat-value large">
                      {usageStats.remaining || 0}
                    </span>
                    <span className="stat-unit">emails</span>
                  </div>
                </div>
              </div>

              {/* Total Generated */}
              <div className="stat-item">
                <div className="stat-icon total-icon">
                  <i className="fa-solid fa-infinity"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">
                    Total Generated (Current Plan)
                  </span>
                  <div className="stat-value-wrapper">
                    <span className="stat-value large">
                      {usageStats.totalGenerated || 0}
                    </span>
                    <span className="stat-unit">emails</span>
                  </div>
                </div>
              </div>

              {/* Plan Limit Info */}
              <div className="stat-item">
                <div className="stat-icon limit-icon">
                  <i className="fa-solid fa-gauge-high"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">
                    Hourly Limit ({subscription.plan})
                  </span>
                  <div className="stat-value-wrapper">
                    <span className="stat-value large">
                      {usageStats.hourlyLimit || 0}
                    </span>
                    <span className="stat-unit">emails/hour</span>
                  </div>
                </div>
              </div>
            </div>

            {usageStats.remaining === 0 && (
              <div className="usage-warning">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <span>
                  You've reached your hourly limit. Upgrade your plan or wait
                  for reset.
                </span>
              </div>
            )}

            {usageStats.remaining > 0 && usageStats.remaining <= 2 && (
              <div className="usage-info">
                <i className="fa-solid fa-info-circle"></i>
                <span>
                  You have {usageStats.remaining} email(s) remaining this hour.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Plan Details Card */}
        <div className="plan-card">
          <div className="plan-header">
            <div className="plan-icon" style={{ backgroundColor: getStatusColor(subscription.status) }}>
              <i className="fa-solid fa-circle"></i>
            </div>
            <div>
              <h4>{subscription.plan} Plan</h4>
              <p className="plan-price">
                ${subscription.price.toFixed(2)}<span className="billing-cycle">{subscription.renewalType === 'monthly' ? 'Billed monthly' : 'Billed annually'}</span>
              </p>
            </div>
          </div>

          {/* Plan Features */}
          <div className="plan-features">
            <h5>Plan Features:</h5>
            <ul>
              {subscription.features && subscription.features.map((feature, index) => (
                <li key={index}>
                  <i className="fa-solid fa-check"></i>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Plan Details Bottom */}
          <div className="plan-info">
            <div className="info-item">
              <i className="fa-solid fa-calendar"></i>
              <div>
                <span>Expires On</span>
                <strong>{subscription.nextBillingDate}</strong>
              </div>
            </div>

            <div className="info-item">
              <i className="fa-solid fa-check-circle"></i>
              <div>
                <span>Payment Status</span>
                <strong>{subscription.paymentStatus}</strong>
              </div>
            </div>

            <div className="info-item">
              <i className="fa-solid fa-credit-card"></i>
              <div>
                <span>Payment Method</span>
                <strong>{subscription.paymentMethod}</strong>
              </div>
            </div>
          </div>

          {subscription.plan !== 'Premium' && (
            <div className="subscription-actions">
              <button className="btn btn-primary" onClick={handleUpgradePlan}>
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <div className="error-loading">
      <i
        className="fa-solid fa-exclamation-circle"
        style={{ fontSize: "32px", color: "#f44336" }}
      ></i>
      <p>Failed to load subscription details</p>
      <button onClick={loadSubscription} className="btn btn-primary">
        Retry
      </button>
    </div>
  )}
</div>
  );
};

export default SubscriptionManagement;

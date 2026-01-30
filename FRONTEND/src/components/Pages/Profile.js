import React, { useState, useEffect } from "react";
import "./PagesCss/Profile.css";
import avatarGif from "../assets/Favicon/logo.gif";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "../Avatar";
import { profileAPI, subscriptionAPI, emailAPI } from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
  const [avatar, setAvatar] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [usageStats, setUsageStats] = useState(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      // If no user or token, redirect to login
      if (!storedUser || !token) {
        toast.error('Please login to view your profile');
        navigate('/sign');
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        setUserData({
          id: user._id || user.id || '',
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '+1 (555) 123-4567',
          location: user.location || 'New York, USA',
        });

        // Set avatar if exists (will be handled by Avatar component)
        if (user.profileImageUrl) {
          setAvatar(user.profileImageUrl);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error loading profile data');
        navigate('/sign');
      }
    };

    loadUserData();
    loadSubscription(); // Load real subscription data
    loadUsageStats(); // Load usage statistics
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
      const sessionId = localStorage.getItem('tempmail_session_id');
      const response = await emailAPI.getUsageStats(sessionId);

      if (response.success) {
        setUsageStats(response.data);
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
      setUsageStats({
        hourlyUsed: 0,
        hourlyLimit: 0,
        remaining: 0,
        totalGenerated: 0,
        userPlan: 'Free'
      });
    } finally {
      setIsLoadingUsage(false);
    }
  };

  // Handle file upload - Auto-save immediately
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }

      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);

      // Auto-save the image immediately
      toast.info("Uploading profile picture...");

      try {
        const updateData = {
          profileImage: file
        };

        const response = await profileAPI.update(userData.id, updateData);

        // Update localStorage with new data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const updatedUser = {
            ...user,
            profileImageUrl: response.data?.profileImageUrl || user.profileImageUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));

          // Update avatar state with new image URL from server
          if (response.data?.profileImageUrl) {
            setAvatar(response.data.profileImageUrl);
          }
        }

        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast.error(error.response?.data?.message || "Error uploading profile picture");
        // Revert to original avatar on error
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAvatar(user.profileImageUrl || null);
        }
      }
    }
  };

  // Handle remove profile image
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      const response = await profileAPI.removeProfileImage(userData.id);

      setAvatar(null);
      setProfileImageFile(null);

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = {
        ...storedUser,
        profileImageUrl: ''
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle Edit Mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset password fields when starting edit
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      toast.error("Passwords do not match!");
      return;
    }

    if (passwordData.newPassword && passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
      };

      // Add password if changed
      if (passwordData.newPassword) {
        updateData.password = passwordData.newPassword;
      }

      // Call API to update profile (image is auto-saved separately)
      const response = await profileAPI.update(userData.id, updateData);

      // Update localStorage with new data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          name: updateData.name,
          email: updateData.email,
          phone: updateData.phone,
          location: updateData.location,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setIsEditing(false);

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || "Error updating profile");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "paused":
        return "#FF9800";
      case "cancelled":
        return "#f44336";
      default:
        return "#666";
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="header-content">
            <div className="avatar-section">
              <label htmlFor="avatar-upload" className="avatar-label">
                <div className="avatar-wrapper-custom">
                  <Avatar
                    imageUrl={avatar}
                    name={userData.name}
                    size="large"
                    className="avatar"
                  />
                  <div className="avatar-overlay">
                    <i className="fa-solid fa-camera"></i>
                    <span>Change</span>
                  </div>
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
              {avatar && (
                <button
                  className="remove-avatar-btn"
                  onClick={handleRemoveAvatar}
                  title="Remove profile picture"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              )}
            </div>
            <div className="user-info">
              <h2>{userData.name || 'User'}</h2>
              <p className="user-email">
                <i className="fa-solid fa-envelope"></i>
                {userData.email || 'user@example.com'}
              </p>
              <p className="user-membership">
                <i className="fa-solid fa-crown"></i>
                {isLoadingSubscription ? 'Loading...' : (subscription?.plan || 'Free')} Member • Joined {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <i className="fa-solid fa-shield-halved"></i>
                <div>
                  <h3>100%</h3>
                  <p>Security Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-nav">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === "user" ? "active" : ""}`}
              onClick={() => setActiveTab("user")}
            >
              <i className="fa-solid fa-user-gear"></i>
              <span>Profile Settings</span>
            </button>
            <button
              className={`nav-tab ${activeTab === "subscription" ? "active" : ""
                }`}
              onClick={() => setActiveTab("subscription")}
            >
              <i className="fa-solid fa-credit-card"></i>
              <span>Subscription</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Profile Settings Tab */}
          {activeTab === "user" && (
            <div className="content-card">
              <div className="card-header">
                <h3>
                  <i className="fa-solid fa-user-circle"></i> Personal
                  Information
                </h3>
                <button
                  className={`edit-toggle-btn ${isEditing ? "editing" : ""}`}
                  onClick={toggleEdit}
                >
                  {isEditing ? (
                    <>
                      <i className="fa-solid fa-times"></i>
                      Cancel Edit
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-pen"></i>
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="form-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label style={{ color: "black" }}>
                      <i className="fa-solid fa-user"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!isEditing}
                      className={isEditing ? "editable" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: "black" }}>
                      <i className="fa-solid fa-envelope"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isEditing}
                      className={isEditing ? "editable" : ""}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="password-section">
                    <h4>
                      <i className="fa-solid fa-key"></i> Change Password
                    </h4>
                    <div className="password-grid">
                      <div className="form-group">
                        <label style={{ color: "black" }}>
                          Current Password
                        </label>
                        <div className="password-input">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility("current")}
                          >
                            <i
                              className={`fa-solid ${showPassword.current ? "fa-eye-slash" : "fa-eye"
                                }`}
                            ></i>
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{ color: "black" }}>New Password</label>
                        <div className="password-input">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            placeholder="Enter new password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "newPassword",
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility("new")}
                          >
                            <i
                              className={`fa-solid ${showPassword.new ? "fa-eye-slash" : "fa-eye"
                                }`}
                            ></i>
                          </button>
                        </div>
                        {passwordData.newPassword && (
                          <div className="password-strength">
                            <div
                              className={`strength-bar ${passwordData.newPassword.length >= 8
                                ? "strong"
                                : "weak"
                                }`}
                            ></div>
                            <span>
                              Password strength:{" "}
                              {passwordData.newPassword.length >= 8
                                ? "Strong"
                                : "Weak"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label style={{ color: "black" }}>
                          Confirm Password
                        </label>
                        <div className="password-input">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility("confirm")}
                          >
                            <i
                              className={`fa-solid ${showPassword.confirm ? "fa-eye-slash" : "fa-eye"
                                }`}
                            ></i>
                          </button>
                        </div>
                        {passwordData.confirmPassword &&
                          passwordData.newPassword !==
                          passwordData.confirmPassword && (
                            <span className="error-text">
                              Passwords do not match
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="form-actions">
                    <button className="btn btn-save" onClick={handleSave}>
                      <i className="fa-solid fa-floppy-disk"></i>
                      Save Changes
                    </button>
                    <button className="btn btn-cancel" onClick={toggleEdit}>
                      <i className="fa-solid fa-times"></i>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="content-card">
              {isLoadingSubscription ? (
                <div className="loading-subscription">
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#16423C' }}></i>
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
                                <span className="stat-value">{usageStats.hourlyUsed || 0}</span>
                                <span className="stat-limit">/ {usageStats.hourlyLimit || 0}</span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${usageStats.hourlyLimit > 0 ? (usageStats.hourlyUsed / usageStats.hourlyLimit * 100) : 0}%`,
                                    backgroundColor: usageStats.hourlyUsed >= usageStats.hourlyLimit ? '#f44336' : '#4CAF50'
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
                                <span className="stat-value large">{usageStats.remaining || 0}</span>
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
                              <span className="stat-label">Total Generated (Current Plan)</span>
                              <div className="stat-value-wrapper">
                                <span className="stat-value large">{usageStats.totalGenerated || 0}</span>
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
                              <span className="stat-label">Hourly Limit ({subscription.plan})</span>
                              <div className="stat-value-wrapper">
                                <span className="stat-value large">{usageStats.hourlyLimit || 0}</span>
                                <span className="stat-unit">emails/hour</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {usageStats.remaining === 0 && (
                          <div className="usage-warning">
                            <i className="fa-solid fa-exclamation-triangle"></i>
                            <span>You've reached your hourly limit. Upgrade your plan or wait for reset.</span>
                          </div>
                        )}

                        {usageStats.remaining > 0 && usageStats.remaining <= 2 && (
                          <div className="usage-info">
                            <i className="fa-solid fa-info-circle"></i>
                            <span>You have {usageStats.remaining} email(s) remaining this hour.</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="plan-card">
                      <div className="plan-header">
                        <div className="plan-icon">
                          <i className="fa-solid fa-diamond"></i>
                        </div>
                        <div>
                          <h4>{subscription.plan} Plan</h4>
                          <p className="plan-price">
                            {subscription.price > 0 ? `$${subscription.price}/month` : 'Free'}
                            <span className="billing-cycle">
                              {subscription.price > 0 ? `Billed ${subscription.renewalType}` : 'No billing'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="plan-features">
                        <h5>Plan Features:</h5>
                        <ul>
                          {subscription.features.map((feature, index) => (
                            <li key={index}>
                              <i className="fa-solid fa-check"></i>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {(subscription.nextBillingDate !== 'N/A' || subscription.plan !== 'Free') && (
                        <div className="plan-info">
                          {subscription.nextBillingDate !== 'N/A' && (
                            <div className="info-item">
                              <i className="fa-solid fa-calendar-check"></i>
                              <div>
                                <span>Expires On</span>
                                <strong>{subscription.nextBillingDate}</strong>
                              </div>
                            </div>
                          )}
                          {subscription.plan !== 'Free' && (
                            <>
                              <div className="info-item">
                                <i className="fa-solid fa-credit-card"></i>
                                <div>
                                  <span>Payment Status</span>
                                  <strong>{subscription.paymentStatus}</strong>
                                </div>
                              </div>
                              {subscription.paymentMethod && subscription.paymentMethod !== 'N/A' && (
                                <div className="info-item">
                                  <i className="fa-solid fa-wallet"></i>
                                  <div>
                                    <span>Payment Method</span>
                                    <strong>{subscription.paymentMethod}</strong>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="subscription-actions">
                      {subscription.plan === 'Free' && (
                        <Link to="/pricing" style={{ textDecoration: "none" }}>
                          <button className="btn btn-upgrade">
                            <i className="fa-solid fa-arrow-up"></i>
                            Upgrade Plan
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="error-loading">
                  <i className="fa-solid fa-exclamation-circle" style={{ fontSize: '32px', color: '#f44336' }}></i>
                  <p>Failed to load subscription details</p>
                  <button onClick={loadSubscription} className="btn btn-primary">Retry</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

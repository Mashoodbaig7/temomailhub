import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api.js';
import './AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    name: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch admin profile on component mount
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      console.log('📤 [Admin Profile] Fetching admin profile...');
      
      const response = await adminAPI.getAdminProfile();
      
      if (response.success) {
        console.log('✅ [Admin Profile] Profile fetched:', response.data);
        setProfileData({
          email: response.data.email,
          name: response.data.name
        });
        setEmailForm({ newEmail: response.data.email });
      } else {
        toast.error(response.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('❌ [Admin Profile] Error fetching profile:', error);
      toast.error('Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle email update
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!emailForm.newEmail) {
      newErrors.newEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailForm.newEmail)) {
      newErrors.newEmail = 'Invalid email format';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (emailForm.newEmail === profileData.email) {
      toast.info('Email is the same as current email');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📤 [Admin Profile] Updating email...');
      
      const response = await adminAPI.updateAdminEmail(emailForm.newEmail);
      
      if (response.success) {
        console.log('✅ [Admin Profile] Email updated successfully');
        setProfileData(prev => ({ ...prev, email: emailForm.newEmail }));
        toast.success('Email updated successfully!');
        setErrors({});
      } else {
        toast.error(response.message || 'Failed to update email');
      }
    } catch (error) {
      console.error('❌ [Admin Profile] Error updating email:', error);
      toast.error(error.response?.data?.message || 'Failed to update email');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      console.log('📤 [Admin Profile] Updating password...');
      
      const response = await adminAPI.updateAdminPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      
      if (response.success) {
        console.log('✅ [Admin Profile] Password updated successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password updated successfully!');
        setErrors({});
      } else {
        toast.error(response.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('❌ [Admin Profile] Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-card">
          <p style={{ textAlign: 'center' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-card">
        <h2 className="admin-profile-title">Admin Profile</h2>
        <p className="admin-profile-subtitle">Update your email and password</p>
        
        {/* Current Profile Info */}
        <div className="profile-info">
          <div className="info-item">
            <label>Current Email:</label>
            <span>{profileData.email}</span>
          </div>
          <div className="info-item">
            <label>Admin Name:</label>
            <span>{profileData.name}</span>
          </div>
        </div>

        {/* Email Update Form */}
        <div className="form-section">
          <h3>Update Email Address</h3>
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">New Email Address</label>
              <input
                type="email"
                id="email"
                value={emailForm.newEmail}
                onChange={(e) => {
                  setEmailForm({ newEmail: e.target.value });
                  setErrors(prev => ({ ...prev, newEmail: '' }));
                }}
                placeholder="Enter new email"
                required
                autoComplete="email"
              />
              {errors.newEmail && (
                <span className="error-message">{errors.newEmail}</span>
              )}
            </div>
            <button 
              type="submit" 
              className="btn-update"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>

        {/* Password Update Form */}
        <div className="form-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                  setErrors(prev => ({ ...prev, currentPassword: '' }));
                }}
                placeholder="Enter current password"
                required
                autoComplete="current-password"
              />
              {errors.currentPassword && (
                <span className="error-message">{errors.currentPassword}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                  setErrors(prev => ({ ...prev, newPassword: '' }));
                }}
                placeholder="Enter new password"
                required
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
            <button 
              type="submit" 
              className="btn-update"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

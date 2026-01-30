import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { contactAPI, subscriptionAPI } from '../../services/api';
import './PagesCss/Contact.css';

const Contact = () => {
  const navigate = useNavigate();
  const hasCheckedAccess = useRef(false);
  const [userPlan, setUserPlan] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check user plan on component mount
  useEffect(() => {
    if (!hasCheckedAccess.current) {
      hasCheckedAccess.current = true;
      checkUserAccess();
    }
  }, []);

  const checkUserAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        // Not logged in - redirect to sign up
        toast.error('Please create an account to access customer support');
        navigate('/sign');
        return;
      }

      // Fetch user's subscription plan
      const response = await subscriptionAPI.getMySubscription();
      const plan = response.data?.currentPlan || 'Free';

      setUserPlan(plan);

      // Check if user has Free plan
      if (plan === 'Free') {
        // Free users cannot access contact page
        toast.error('Customer support is only available for Standard and Premium users. Please upgrade your plan.');
        setTimeout(() => {
          navigate('/pricing');
        }, 2000);
        return;
      }

      setIsCheckingAccess(false);
    } catch (error) {
      console.error('Error checking user access:', error);
      toast.error('Failed to verify access. Please try again.');
      navigate('/');
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await contactAPI.submit(formData);

      if (response.success) {
        toast.success(response.message || 'Message sent successfully!');

        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

        setSubmitted(true);

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="contact-page">
        <div className="contact-wrapper">
          <div className="contact-container">
            <div className="access-check-loading">
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '48px', color: '#16423C' }}></i>
              <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>Verifying access...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="contact-wrapper">
        <div className="contact-container">
          <div className="contact-form-section">
            <div className="form-header">
              <h1 className="form-title">
                <i className="fa-solid fa-envelope-open-text"></i>
                Contact Us
              </h1>
              <p className="form-description">
                We welcome any questions, technical inquiries, bug reports,
                suggestions, or other issues you may have. Please feel free to contact us.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fa-solid fa-user"></i>
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <i className="fa-solid fa-envelope"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <i className="fa-solid fa-message"></i>
                  Your Message
                </label>
                <textarea
                  id="message"
                  className="form-textarea"
                  rows="6"
                  placeholder="Please describe your inquiry in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {submitted && (
                <div className="success-message">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
              )}

              <div className="form-submit">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="contact-info-section">
            <div className="info-card">
              <div className="info-icon">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="info-content">
                <h3>Response Time</h3>
                <p>We typically respond within 24-48 hours</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div className="info-content">
                <h3>Support Hours</h3>
                <p>Monday - Friday: 9 AM - 6 PM EST</p>
              </div>
            </div>



            <div className="info-card">
              <div className="info-icon">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div className="info-content">
                <h3>Urgent Issues</h3>
                <p>For critical technical issues, please include "URGENT" in your subject line</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
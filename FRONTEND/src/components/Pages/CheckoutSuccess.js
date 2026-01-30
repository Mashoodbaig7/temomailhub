import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { subscriptionAPI } from '../../services/api';
import './PagesCss/CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleCheckoutSuccess = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        const token = searchParams.get('token');
        const PayerID = searchParams.get('PayerID');

        console.log('🔵 [Checkout Success] Initializing...');
        console.log('  Session ID (Stripe):', sessionId);
        console.log('  Token (PayPal):', token);
        console.log('  PayerID (PayPal):', PayerID);

        // Check if user is authenticated
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          console.error('❌ [Checkout Success] User not authenticated');
          setError('You must be logged in to complete this payment');
          setLoading(false);
          setTimeout(() => navigate('/sign'), 2000);
          return;
        }

        // Handle Stripe Checkout Session
        if (sessionId) {
          console.log('📤 [Stripe] Processing checkout session...');
          
          // For Stripe, we need to retrieve the session and activate the subscription
          // The session metadata contains the order information
          const response = await subscriptionAPI.stripe.retrieveCheckoutSession(sessionId);
          
          console.log('✅ [Stripe] Session retrieved:', response);

          if (response.success) {
            setSuccess(true);
            toast.success('🎉 Payment successful! Your subscription has been activated.', {
              position: "top-center",
              autoClose: 3000,
            });

            // Refresh user plan and stats if function exists
            if (window.refreshUserPlanAndStats) {
              await window.refreshUserPlanAndStats();
            }

            // Redirect to profile after 2 seconds
            setTimeout(() => {
              navigate('/profile');
            }, 2000);
          } else {
            throw new Error(response.message || 'Failed to retrieve checkout session');
          }
          return;
        }

        // Handle PayPal Callback
        if (token && PayerID) {
          console.log('📤 [PayPal] Processing order...');

          // Get stored payment details from sessionStorage
          const paymentDetails = sessionStorage.getItem('paypalPaymentDetails');
          if (!paymentDetails) {
            console.error('❌ [Checkout Success] Payment details not found in session');
            setError('Payment details not found. Please try again.');
            setLoading(false);
            setTimeout(() => navigate('/pricing'), 2000);
            return;
          }

          const { orderId, planName, billingCycle } = JSON.parse(paymentDetails);

          console.log('📤 [PayPal] Capturing order...');
          console.log('  Order ID:', orderId);
          console.log('  Plan:', planName);
          console.log('  Billing Cycle:', billingCycle);

          // Call the backend to capture the order and activate the plan
          const response = await subscriptionAPI.paypal.captureOrder(orderId, planName, billingCycle);

          console.log('✅ [PayPal] Order captured:', response);

          if (response.success) {
            setSuccess(true);
            toast.success('🎉 Payment successful! Your subscription has been activated.', {
              position: "top-center",
              autoClose: 3000,
            });

            // Clear session storage
            sessionStorage.removeItem('paypalPaymentDetails');

            // Refresh user plan and stats if function exists
            if (window.refreshUserPlanAndStats) {
              await window.refreshUserPlanAndStats();
            }

            // Redirect to profile after 2 seconds
            setTimeout(() => {
              navigate('/profile');
            }, 2000);
          } else {
            throw new Error(response.message || 'Failed to capture payment');
          }
          return;
        }

        // If neither Stripe nor PayPal callback, show error
        console.error('❌ [Checkout Success] No valid payment callback found');
        setError('No valid payment information found. Please try again.');
        setLoading(false);

      } catch (err) {
        console.error('❌ [Checkout Success] Error:', err);
        setError(err.message || 'An error occurred while processing your payment');
        setLoading(false);

        toast.error(err.message || 'Payment processing failed', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    };

    handleCheckoutSuccess();
  }, [searchParams, navigate]);

  return (
    <div className="checkout-success-container">
      {loading && !error && (
        <div className="success-card loading">
          <div className="spinner"></div>
          <h2>Processing Your Payment</h2>
          <p>Please wait while we complete your PayPal payment...</p>
        </div>
      )}

      {success && (
        <div className="success-card success">
          <div className="success-icon">
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <h2>Payment Successful! 🎉</h2>
          <p>Your subscription has been activated successfully.</p>
          <p>Redirecting to your profile...</p>
        </div>
      )}

      {error && (
        <div className="success-card error">
          <div className="error-icon">
            <i className="fa-solid fa-exclamation-circle"></i>
          </div>
          <h2>Payment Processing Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/pricing')} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutSuccess;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { subscriptionAPI } from '../../services/api';
import './PagesCss/CheckoutModal.css'

// Load PayPal
const loadPayPalScript = () => {
  return new Promise((resolve) => {
    if (window.paypal) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID || 'TEST_CLIENT_ID'}`;
      script.onload = () => resolve();
      document.body.appendChild(script);
    }
  });
};

const CheckoutModal = ({ plan, isYearly, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    promoCode: ''
  });

  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);

  // Calculate totals
  const subtotal = plan.price;
  const tax = subtotal * 0.1; // 10% tax
  const promoAmount = promoApplied ? subtotal * 0.1 : 0; // 10% promo discount
  const total = subtotal + tax - promoAmount;

  // Initialize PayPal on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Load PayPal
    loadPayPalScript().then(() => setPaypalReady(true));

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyPromoCode = () => {
    if (formData.promoCode === 'WELCOME10') {
      setPromoApplied(true);
      toast.success('Promo code applied successfully! 10% discount applied.', {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      toast.error('Invalid promo code. Please try again.', {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  // Handle Stripe Payment - Redirect to Stripe Checkout
  const handleStripePayment = async (e) => {
    e.preventDefault();

    // Validation
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      toast.error('Please create an account first to subscribe to a plan', {
        position: "top-center",
        autoClose: 3000,
      });
      setTimeout(() => {
        onClose();
        navigate('/sign');
      }, 1000);
      return;
    }

    if (!formData.email || !formData.name) {
      toast.error('Please fill in email and name', {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 [Stripe] Starting payment process...');
      console.log('  Plan:', plan.name);
      console.log('  Amount:', total);
      console.log('  Email:', formData.email);

      // Create Stripe Checkout Session
      console.log('📤 [Stripe] Creating checkout session...');
      const checkoutResponse = await subscriptionAPI.stripe.createCheckoutSession(
        plan.name,
        isYearly ? 'yearly' : 'monthly',
        total,
        formData.email,
        formData.name
      );

      console.log('✅ [Stripe] Checkout session created:', checkoutResponse);

      if (!checkoutResponse.success || !checkoutResponse.data.sessionUrl) {
        throw new Error(checkoutResponse.message || 'Failed to create checkout session');
      }

      console.log('🔗 [Stripe] Redirecting to checkout:', checkoutResponse.data.sessionUrl);
      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.data.sessionUrl;
    } catch (error) {
      console.error('❌ [Stripe] Payment error:', error);
      console.error('  Error message:', error.message);
      console.error('  Error response:', error.response?.data);
      
      let errorMessage = error.message || 'Payment failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle PayPal Payment
  const handlePayPalPayment = async (e) => {
    e.preventDefault();

    // Validation
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      toast.error('Please create an account first to subscribe to a plan', {
        position: "top-center",
        autoClose: 3000,
      });
      setTimeout(() => {
        onClose();
        navigate('/sign');
      }, 1000);
      return;
    }

    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields', {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🟡 [PayPal] Starting payment process...');
      console.log('  Plan:', plan.name);
      console.log('  Amount:', total);
      console.log('  Email:', formData.email);

      // Create PayPal Order
      console.log('📤 [PayPal] Creating order via API...');
      const orderResponse = await subscriptionAPI.paypal.createOrder(
        plan.name,
        isYearly ? 'yearly' : 'monthly',
        total,
        subtotal,
        tax,
        promoAmount,
        formData.email,
        formData.name
      );

      console.log('✅ [PayPal] Order response:', orderResponse);

      if (!orderResponse.success || !orderResponse.data.approvalLink) {
        console.error('❌ [PayPal] Invalid order response');
        throw new Error('Failed to create PayPal order');
      }

      // Store payment details in session storage for callback
      const paymentDetails = {
        orderId: orderResponse.data.orderId,
        planName: plan.name,
        billingCycle: isYearly ? 'yearly' : 'monthly'
      };
      sessionStorage.setItem('paypalPaymentDetails', JSON.stringify(paymentDetails));
      console.log('✅ [PayPal] Stored payment details:', paymentDetails);

      console.log('🔗 [PayPal] Redirecting to approval link:', orderResponse.data.approvalLink);
      // Redirect to PayPal approval
      window.location.href = orderResponse.data.approvalLink;
    } catch (error) {
      console.error('❌ [PayPal] Payment error:', error);
      console.error('  Error message:', error.message);
      console.error('  Error response:', error.response?.data);
      
      toast.error(error.response?.data?.message || error.message || 'Failed to create PayPal order. Please try again.', {
        position: "top-center",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (paymentMethod === 'stripe') {
      await handleStripePayment(e);
    } else {
      await handlePayPalPayment(e);
    }
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>
              <i className="fa-solid fa-lock"></i>
              Complete Your Purchase
            </h2>
            <p>Secure checkout powered by Stripe & PayPal</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          <div className="checkout-container">
            {/* Left Column - Order Summary */}
            <div className="order-summary">
              <div className="summary-header">
                <h3>
                  <i className="fa-solid fa-receipt"></i>
                  Order Summary
                </h3>
                <div className="plan-badge-summary">
                  <span className={`plan-tag ${plan.id}`}>
                    {plan.name} Plan
                  </span>
                  <span className="billing-period">
                    {isYearly ? 'Yearly Billing' : 'Monthly Billing'}
                  </span>
                </div>
              </div>

              <div className="summary-details">
                <div className="plan-detail">
                  <div>
                    <h4>{plan.name} Plan</h4>
                    <p>Billed {isYearly ? 'yearly' : 'monthly'}</p>
                  </div>
                  <span className="plan-price">{formatPrice(plan.price)}</span>
                </div>

                <div className="discount-section">
                  <div className="promo-input">
                    <input
                      type="text"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleInputChange}
                      placeholder="Enter promo code"
                      disabled={promoApplied}
                    />
                    <button
                      className="apply-promo-btn"
                      onClick={applyPromoCode}
                      disabled={promoApplied}
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {promoApplied && (
                    <div className="promo-success">
                      <i className="fa-solid fa-check-circle"></i>
                      <span>10% discount applied!</span>
                    </div>
                  )}
                </div>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="price-row">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {promoApplied && (
                    <div className="price-row discount">
                      <span>
                        <i className="fa-solid fa-tag"></i>
                        Promo Discount
                      </span>
                      <span>-{formatPrice(promoAmount)}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>
                      <strong>Total</strong>
                      <small>Due today</small>
                    </span>
                    <span className="total-price">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="features-list-summary">
                  <h5>What's included:</h5>
                  <ul>
                    <li><i className="fa-solid fa-check"></i> Secure & Private Emails</li>
                    <li><i className="fa-solid fa-check"></i> {plan.id === 'standard' ? '20' : '100+'} Email Storage</li>
                    <li><i className="fa-solid fa-check"></i> Priority Support</li>
                    <li><i className="fa-solid fa-check"></i> Ad-free Experience</li>
                  </ul>
                </div>

                <div className="guarantee-badge">
                  <i className="fa-solid fa-shield-check"></i>
                  <div>
                    <strong>30-Day Money-Back Guarantee</strong>
                    <p>If you're not satisfied, get a full refund within 30 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="payment-section">
              <div className="payment-methods">
                <div className="method-tabs">
                  <button
                    className={`method-tab ${paymentMethod === 'stripe' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <i className="fa-brands fa-cc-stripe"></i>
                    Credit Card
                  </button>
                  <button
                    className={`method-tab ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <i className="fa-brands fa-paypal"></i>
                    PayPal
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                  {/* Common Fields */}
                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fa-solid fa-envelope"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fa-solid fa-user"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required 
                    />
                  </div>

                  {paymentMethod === 'stripe' ? (
                    /* Stripe Payment - Redirect to Checkout */
                    <>
                      <div className="paypal-info">
                        <i className="fa-brands fa-cc-stripe"></i>
                        <div>
                          <h4>Pay with Credit Card</h4>
                          <p>Secure payment via Stripe Checkout</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* PayPal Payment */
                    <>
                      <div className="paypal-info">
                        <i className="fa-brands fa-paypal"></i>
                        <div>
                          <h4>Pay with PayPal</h4>
                          <p>You will be redirected to PayPal to complete your payment</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="terms-agreement">
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        required
                      />
                      <label htmlFor="terms">
                        I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                      </label>
                    </div>

                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="subscription"
                        name="subscription"
                        required
                      />
                      <label htmlFor="subscription">
                        I understand this is a recurring subscription that auto-renews
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="submit-payment-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock"></i>
                        Pay {formatPrice(total)} Now
                      </>
                    )}
                  </button>

                  <div className="secure-payment-note">
                    <i className="fa-solid fa-shield-check"></i>
                    <span>Your payment is secure and encrypted</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default CheckoutModal;
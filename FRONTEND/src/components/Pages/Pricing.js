import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./PagesCss/Pricing.css";
import "./PagesCss/f&q.css";
import CheckoutModal from "./CheckoutModal";
import authContext from "../../context/AuthContext";


const faqs = [
  {
    id: 1,
    header: "Will My Subscription Auto-Renew?",
    text: `Yes. Your Subscription will Auto-Renew Monthly or Yearly as per Plan Selected by You.`,
  },
  {
    id: 2,
    header: "How Can I Cancel My Subscription?",
    text: `You can go into Your Account then in Subscription At last You Will Find Delete Subscription or Pause Subscription You can choose as per Your need's.`,
  },
  {
    id: 3,
    header: "What Payment Methods Do You Accept?",
    text: `We accept major Credit Cards, Debit Cards, Google Pay, Apple Pay, PayPal, and other secure payment methods. Please visit our payment page for more details.`,
  },
  {
    id: 4,
    header: "Can I Upgrade My Plan?",
    text: `Yes, you can upgrade your plan at any time. Any changes will take effect immediately after confirmation.`,
  },
  {
    id: 5,
    header: "Do You Offer a Money-Back Guarantee?",
    text: `Yes, we offer a 15-day money-back guarantee if you are not satisfied with the service. Please refer to our refund policy for further details.`,
  },
];

const AccordionItem = (props) => {
  const contentEl = useRef();
  const { handleToggle, active, faq } = props;
  const { header, id, text } = faq;
  

  return (
    <div className="pricing-accordion-card">
      <div className="pricing-accordion-header">
        <div
          className={`pricing-accordion-toggle ${active === id ? "pricing-active" : ""
            }`}
          onClick={() => handleToggle(id)}
        >
          <h5 className="pricing-accordion-title">{header}</h5>
          <i className="fa fa-chevron-down pricing-accordion-icon"></i>
        </div>
      </div>
      <div
        ref={contentEl}
        className={`pricing-collapse ${active === id ? "pricing-show" : ""
          }`}
        style={
          active === id
            ? { height: contentEl.current.scrollHeight }
            : { height: "0px" }
        }
      >
        <div className="pricing-accordion-body">
          <p className="pricing-mb-0">{text}</p>
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const user = useContext(authContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calculateSavings = (monthlyPrice, yearlyPrice) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    return {
      amount: savings,
      percentage: Math.round((savings / monthlyTotal) * 100),
    };
  };

  const standardSavings = calculateSavings(10, 60);
  const premiumSavings = calculateSavings(20, 120);

  const handleSignUpClick = () => {
    navigate("/");
  };

  const handleSwitchToggle = () => {
    setIsYearly(!isYearly);
  };

  const handlePlanSelect = (plan) => {
    if(user === false){
      navigate("/sign");
      return;
    }

    setSelectedPlan(plan);
    setActivePlan(plan.id);
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    alert("Payment successful! Thank you for your subscription.");
  };

  const plans = [
    {
      id: "basic",
      name: "Free Plan",
      price: 0,
      yearlyPrice: 0,
      description: "Perfect for getting started",
      features: [
        { text: "Randomly Generated Email Addresses", available: true },
        { text: "Emails Auto-Delete After 10 Minutes", available: true },
        { text: "No inbox storage", available: true },
        { text: "Limited to 5 emails per hour", available: true },
        { text: "No custom domain support", available: true },
        { text: "No attachment support", available: true },
        { text: "Public inbox access", available: true },
        { text: "No Customer Support", available: true },
      ],
      buttonText: "Get Started Free",
      buttonColor: "#6A9C89",
      tag: "Free Forever",
      tagline: "Perfect for casual users",
      popular: false,
      icon: "fa-user",
      onSelect: () => handleSignUpClick(),
    },
    {
      id: "standard",
      name: "Standard",
      price: 10,
      yearlyPrice: 60,
      description: "Best for regular users",
      features: [
        { text: "Custom email addresses", available: true },
        { text: "Emails Expire in 12 Hours", available: true },
        { text: "20 emails inbox storage", available: true },
        { text: "Attachment support (up to 1MB)", available: true },
        { text: "Faster email delivery", available: true },
        { text: "Private inbox access", available: true },
        { text: "Ad-free experience", available: true },
        { text: "Priority Email Support", available: true },
      ],
      buttonText: "Start Standard Plan",
      buttonColor: "#16423C",
      tag: "Most Popular",
      tagline: "Best value for money",
      popular: true,
      icon: "fa-user-check",
      savings: standardSavings,
      onSelect: () => handlePlanSelect({
        id: "standard",
        name: "Standard",
        price: isYearly ? 60 : 10,
        period: isYearly ? "year" : "month",
        isYearly: isYearly
      }),
    },
    {
      id: "premium",
      name: "Premium",
      price: 20,
      yearlyPrice: 120,
      description: "For power users & businesses",
      features: [
        { text: "Permanent email storage", available: true },
        { text: "Custom domain support", available: true },
        { text: "Emails Expire in 24 Hours", available: true },
        { text: "100+ emails inbox storage", available: true },
        { text: "Full attachment support (10MB)", available: true },
        { text: "Priority email delivery", available: true },
        { text: "Advanced spam filtering", available: true },
        { text: "Ad-free experience", available: true },
        { text: "Priority Email Support", available: true },
      ],
      buttonText: "Start Premium Plan",
      buttonColor: "#16423C",
      tag: "Premium",
      tagline: "Maximum productivity",
      popular: false,
      icon: "fa-crown",
      savings: premiumSavings,
      onSelect: () => handlePlanSelect({
        id: "premium",
        name: "Premium",
        price: isYearly ? 120 : 20,
        period: isYearly ? "year" : "month",
        isYearly: isYearly
      }),
    },
  ];

  const [active, setActive] = useState(null);

  const handleToggle = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <div className="pricing-container">
      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          isYearly={isYearly}
          onClose={handleCheckoutClose}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Floating CTA */}
      {scrolled && (
        <div className="pricing-floating-cta">
          <div className="pricing-floating-content">
            <span>Ready to get started?</span>
            <button onClick={handleSignUpClick} className="pricing-floating-btn">
              Start Free Plan <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pricing-hero-section">
        <div className="pricing-hero-bg">
          <div className="pricing-hero-shape pricing-hero-shape-1"></div>
          <div className="pricing-hero-shape pricing-hero-shape-2"></div>
          <div className="pricing-hero-shape pricing-hero-shape-3"></div>
        </div>
        <div className="pricing-hero-content">
          <div className="pricing-hero-text">
            <div className="pricing-hero-badge">
              <i className="fa-solid fa-star"></i>
              Flexible Pricing Plans
            </div>
            <h1 className="pricing-hero-title">
              Choose the Perfect Plan for Your Needs
            </h1>
            <p className="pricing-hero-subtitle">
              Select from our range of professional email solutions designed to
              protect your privacy and enhance your productivity. All plans
              include our award-winning security features.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="pricing-toggle-wrapper">
            <div className="pricing-toggle-section">
              <div className="pricing-toggle-header">
                <h3>Choose Billing Period</h3>
                <p>Switch between monthly and yearly billing</p>
              </div>
              <div className="pricing-toggle-content">
                <span className={`pricing-toggle-label ${!isYearly ? "pricing-toggle-active" : ""}`}>
                  <span className="pricing-toggle-label-main">Monthly</span>
                  <span className="pricing-toggle-label-sub">Pay as you go</span>
                  {!isYearly && (
                    <span className="pricing-toggle-badge">
                      <i className="fa-solid fa-calendar"></i>
                      No Commitment
                    </span>
                  )}
                </span>

                <div className="pricing-toggle-switch-container">
                  <div className="pricing-toggle-switch" onClick={handleSwitchToggle}>
                    <div className="pricing-toggle-track"></div>
                    <div
                      className={`pricing-toggle-knob ${isYearly ? "pricing-toggle-yearly" : "pricing-toggle-monthly"
                        }`}
                    >
                      <i
                        className={`fa-solid ${isYearly ? "fa-calendar-days" : "fa-calendar"
                          }`}
                      ></i>
                    </div>
                  </div>
                  <div className="pricing-toggle-indicator">
                    <span className={!isYearly ? "pricing-toggle-active" : ""}>Monthly</span>
                    <span className={isYearly ? "pricing-toggle-active" : ""}>Yearly</span>
                  </div>
                </div>

                <span className={`pricing-toggle-label ${isYearly ? "pricing-toggle-active" : ""}`}>
                  <span className="pricing-toggle-label-main">Yearly</span>
                  <span className="pricing-toggle-label-sub">Best value</span>
                  {isYearly && (
                    <span className="pricing-toggle-badge pricing-toggle-savings">
                      <i className="fa-solid fa-gift"></i>
                      Save up to 50%
                    </span>
                  )}
                </span>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pricing-plans-section">
        <div className="pricing-plans-container">
          <div className="pricing-plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-plan-card pricing-plan-${plan.id} ${hoveredCard === plan.id ? "pricing-plan-hovered" : ""
                  } ${activePlan === plan.id ? "pricing-plan-active" : ""} ${plan.popular ? "pricing-plan-popular" : ""
                  }`}
                onMouseEnter={() => setHoveredCard(plan.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Glow Effect */}
                <div className="pricing-card-glow"></div>

                {/* Plan Badge */}
                <div
                  className={`pricing-plan-badge ${plan.popular ? "pricing-popular-badge" : "pricing-value-badge"
                    }`}
                >
                  <div className="pricing-badge-ribbon">
                    <i
                      className={`fa-solid ${plan.popular
                          ? "fa-fire"
                          : plan.id === "premium"
                            ? "fa-crown"
                            : "fa-bolt"
                        }`}
                    ></i>
                    <span className="pricing-badge-text">{plan.tag}</span>
                  </div>
                  <div className="pricing-badge-tagline">{plan.tagline}</div>
                </div>

                {/* Plan Header */}
                <div className="pricing-plan-header">
                  <div className="pricing-plan-icon-wrapper">
                    <div className="pricing-plan-icon">
                      <i className={`fa-solid ${plan.icon}`}></i>
                    </div>
                  </div>
                  <div className="pricing-plan-title">
                    <h3 className="pricing-plan-name">{plan.name}</h3>
                    <p className="pricing-plan-description">{plan.description}</p>
                  </div>
                </div>

                {/* Plan Pricing */}
                <div className="pricing-plan-pricing">
                  <div className="pricing-price-display">
                    <div className="pricing-price-main">
                      <span className="pricing-price-currency">$</span>
                      <span className="pricing-price-amount">
                        {isYearly ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="pricing-price-period">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>
                    {plan.id !== "basic" && isYearly && plan.savings && (
                      <div className="pricing-yearly-savings">
                        <i className="fa-solid fa-piggy-bank"></i>
                        <span className="pricing-savings-text">
                          Save ${plan.savings.amount} ({plan.savings.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {plan.id === "basic" && (
                    <div className="pricing-free-badge">
                      <i className="fa-solid fa-infinity"></i>
                      <span>Free Forever</span>
                    </div>
                  )}

                  {plan.id !== "basic" && (
                    <div className="pricing-billing-info">
                      <span className="pricing-monthly-equivalent">
                        ${plan.price}/month
                      </span>
                      <span className="pricing-billing-period">
                        {isYearly ? "Billed annually" : "Billed monthly"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Features */}
                <div className="pricing-plan-features">
                  <h4 className="pricing-features-title">
                    <i className="fa-solid fa-list-check"></i>
                    What's Included
                  </h4>
                  <ul className="pricing-features-list">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="pricing-feature-item">
                        <span className="pricing-feature-icon">
                          <i
                            className={`fa-solid ${feature.available
                                ? "fa-check-circle"
                                : "fa-times-circle"
                              }`}
                          ></i>
                        </span>
                        <span className="pricing-feature-text">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Footer */}
                <div className="pricing-plan-footer">
                  <button
                    className={`pricing-plan-btn pricing-plan-${plan.id}-btn`}
                    onClick={plan.onSelect}
                    style={{ background: plan.buttonColor }}
                  >
                    <span className="pricing-btn-text">{plan.buttonText}</span>
                    <i className="fa-solid fa-arrow-right pricing-btn-arrow"></i>
                  </button>

                  {plan.id !== "basic" && (
                    <div className="pricing-auto-renewal">
                      <i className="fa-solid fa-sync"></i>
                      <span>Auto-renewal • Cancel anytime</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pricing-comparison-section" id="plan-comparison">
        <div className="pricing-section-header">
          <div className="pricing-section-badge">
            <i className="fa-solid fa-table"></i>
            Detailed Comparison
          </div>
          <h2>Plan Feature Comparison</h2>
          <p className="pricing-section-subtitle">
            Compare all features across our plans at a glance
          </p>
        </div>
        <div className="pricing-comparison-container">
          <div className="pricing-comparison-table">
            <table>
              <thead>
                <tr>
                  <th className="pricing-feature-col">Features</th>
                  <th className="pricing-plan-col pricing-plan-free">
                    <div className="pricing-plan-header-cell">
                      <div className="pricing-plan-icon-sm">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <span className="pricing-plan-name-cell">Free</span>
                      <span className="pricing-plan-price-cell">$0/month</span>
                    </div>
                  </th>
                  <th className="pricing-plan-col pricing-plan-standard">
                    <div className="pricing-plan-header-cell">
                      <div className="pricing-plan-icon-sm">
                        <i className="fa-solid fa-user-check"></i>
                      </div>
                      <span className="pricing-plan-name-cell">Standard</span>
                      <span className="pricing-plan-price-cell">$10/month</span>
                      <span className="pricing-plan-popular-tag">Most Popular</span>
                    </div>
                  </th>
                  <th className="pricing-plan-col pricing-plan-premium">
                    <div className="pricing-plan-header-cell">
                      <div className="pricing-plan-icon-sm">
                        <i className="fa-solid fa-crown"></i>
                      </div>
                      <span className="pricing-plan-name-cell">Premium</span>
                      <span className="pricing-plan-price-cell">$20/month</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="pricing-feature-name">Email Storage Duration</span>
                    <span className="pricing-feature-desc">
                      How long emails are stored
                    </span>
                  </td>
                  <td className="pricing-plan-free">
                    <span className="pricing-feature-value">10 Minutes</span>
                    <i className="pricing-feature-icon fa-solid fa-clock"></i>
                  </td>
                  <td className="pricing-plan-standard">
                    <span className="pricing-feature-value">12 Hours</span>
                    <i className="pricing-feature-icon fa-solid fa-clock"></i>
                  </td>
                  <td className="pricing-plan-premium">
                    <span className="pricing-feature-value pricing-feature-highlight">24 Hours</span>
                    <i className="pricing-feature-icon fa-solid fa-clock"></i>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="pricing-feature-name">Inbox Storage</span>
                    <span className="pricing-feature-desc">
                      Maximum email storage capacity
                    </span>
                  </td>
                  <td className="pricing-plan-free">
                    <span className="pricing-feature-value">None</span>
                  </td>
                  <td className="pricing-plan-standard">
                    <span className="pricing-feature-value">20 Emails</span>
                  </td>
                  <td className="pricing-plan-premium">
                    <span className="pricing-feature-value pricing-feature-highlight">100+ Emails</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="pricing-feature-name">Custom Email Address</span>
                    <span className="pricing-feature-desc">
                      Personalized email addresses
                    </span>
                  </td>
                  <td className="pricing-plan-free">
                    <i className="fa-solid fa-times pricing-feature-unavailable"></i>
                  </td>
                  <td className="pricing-plan-standard">
                    <i className="fa-solid fa-check pricing-feature-available"></i>
                  </td>
                  <td className="pricing-plan-premium">
                    <i className="fa-solid fa-check pricing-feature-available"></i>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="pricing-feature-name">Attachment Support</span>
                    <span className="pricing-feature-desc">
                      Maximum file attachment size
                    </span>
                  </td>
                  <td className="pricing-plan-free">
                    <i className="fa-solid fa-times pricing-feature-unavailable"></i>
                  </td>
                  <td className="pricing-plan-standard">
                    <span className="pricing-feature-value">Up to 1MB</span>
                  </td>
                  <td className="pricing-plan-premium">
                    <span className="pricing-feature-value pricing-feature-highlight">Up to 10MB</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="pricing-feature-name">Customer Support</span>
                    <span className="pricing-feature-desc">
                      Support availability and type
                    </span>
                  </td>
                  <td className="pricing-plan-free">
                    <span className="pricing-feature-value">None</span>
                  </td>
                  <td className="pricing-plan-standard">
                    <span className="pricing-feature-value">Priority Email</span>
                  </td>
                  <td className="pricing-plan-premium">
                    <span className="pricing-feature-value pricing-feature-highlight">
                      Priority 24/7
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pricing-faq-section">
        <div className="pricing-faq-container">
          <div className="pricing-faq-header">
            <div className="pricing-faq-badge">
              <i className="fa-solid fa-circle-question"></i>
              Frequently Asked Questions
            </div>
            <h2>Need More Information?</h2>
            <p className="pricing-faq-subtitle">
              Get answers to common questions about our pricing and subscriptions
            </p>
          </div>

          <div className="pricing-faq-content">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                active={active}
                handleToggle={handleToggle}
                faq={faq}
              />
            ))}
          </div>

          <div className="pricing-faq-footer">
            <div className="pricing-faq-contact">
              <i className="fa-solid fa-comments"></i>
              <div>
                <p>Still have questions?</p>
                <Link to="/contact" className="pricing-contact-link">
                  Contact our support team
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing-cta-section">
        <div className="pricing-cta-bg">
          <div className="pricing-cta-shape pricing-cta-shape-1"></div>
          <div className="pricing-cta-shape pricing-cta-shape-2"></div>
          <div className="pricing-cta-shape pricing-cta-shape-3"></div>
        </div>
        <div className="pricing-cta-content">
          <div className="pricing-cta-badge">
            <i className="fa-solid fa-rocket"></i>
            Ready to Get Started?
          </div>
          <h2>Start Protecting Your Privacy Today</h2>
          <p>
            Join thousands of satisfied users who trust Temp-MailHub for their
            temporary email needs. Experience the difference with our
            award-winning service.
          </p>
          <div className="pricing-cta-buttons">
            <button className="pricing-cta-btn pricing-cta-btn-primary" onClick={handleSignUpClick}>
              <i className="fa-solid fa-play"></i>
              Start Free Plan
            </button>
            <Link to="/contact">
              <button className="pricing-cta-btn pricing-cta-btn-secondary">
                <i className="fa-solid fa-comments"></i>
                Contact us
              </button>
            </Link>
          </div>
          <div className="pricing-cta-footer">
            <div className="pricing-cta-features">
              <span>
                <i className="fa-solid fa-shield-alt"></i>
                No credit card required
              </span>
              <span>
                <i className="fa-solid fa-clock"></i>
                Setup in 2 minutes
              </span>
              <span>
                <i className="fa-solid fa-user-check"></i>
                24/7 Customer Support
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
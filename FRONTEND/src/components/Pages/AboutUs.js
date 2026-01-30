import React, { useState, useEffect } from 'react';
import './PagesCss/LegalInformation.css';

const AboutUs = () => {
  const [stats, setStats] = useState({
    users: 0,
    emails: 0,
    countries: 0
  });

  // Animate stats on component mount
  useEffect(() => {
    const animateStat = (endValue, setter, duration = 2000) => {
      let startValue = 0;
      const increment = endValue / (duration / 16); // 60fps
      const timer = setInterval(() => {
        startValue += increment;
        if (startValue >= endValue) {
          startValue = endValue;
          clearInterval(timer);
        }
        setter(Math.floor(startValue));
      }, 16);
    };

    animateStat(10000, (value) => setStats(prev => ({ ...prev, users: value })));
    animateStat(500000, (value) => setStats(prev => ({ ...prev, emails: value })));
    animateStat(150, (value) => setStats(prev => ({ ...prev, countries: value })));
  }, []);

  const features = [
    {
      icon: 'fa-solid fa-bolt',
      title: 'Instant Email Generation',
      description: 'Get a temporary email address in seconds',
      color: '#16423C'
    },
    {
      icon: 'fa-solid fa-inbox',
      title: 'Automatic Inbox',
      description: 'Receive emails instantly and view them within the app',
      color: '#6A9C89'
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Spam Protection',
      description: 'Keep your personal inbox free from unwanted emails',
      color: '#16423C'
    },
    {
      icon: 'fa-solid fa-user-secret',
      title: 'Secure & Anonymous',
      description: 'No personal information is required',
      color: '#6A9C89'
    },
    {
      icon: 'fa-solid fa-mobile-screen',
      title: 'Multi-Platform Access',
      description: 'Use Temp-MailHub on mobile or web',
      color: '#16423C'
    }
  ];

  const values = [
    {
      icon: 'fa-solid fa-lock',
      title: 'Privacy First',
      description: 'Your anonymity is our top priority'
    },
    {
      icon: 'fa-solid fa-rocket',
      title: 'Speed & Efficiency',
      description: 'Instant access without delays'
    },
    {
      icon: 'fa-solid fa-handshake',
      title: 'Trust & Reliability',
      description: 'Backed by D-Tech Studios quality'
    },
    {
      icon: 'fa-solid fa-users',
      title: 'User-Centric',
      description: 'Designed with your needs in mind'
    }
  ];

  const technologies = [
    'Cloud Infrastructure',
    'Real-time Processing',
    'Advanced Security',
    'Scalable Architecture',
    'Cross-Platform Compatibility'
  ];

  const advertisingPartners = [
    {
      name: 'Google AdMob',
      description: 'Trusted mobile advertising platform',
      icon: 'fa-brands fa-google'
    },
    {
      name: 'Facebook Audience Network',
      description: 'Premium advertising network',
      icon: 'fa-brands fa-facebook'
    }
  ];

  return (
    <div className="about-us-page">
      <div className="about-us-container">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="hero-highlight">Temp</span>-MailHub
              </h1>
              <p className="hero-subtitle">
                An innovative product by <strong>D-Tech Studios</strong>
              </p>
              <p className="hero-description">
                Fast, secure, and anonymous temporary email services designed to protect your 
                privacy and simplify your online experience.
              </p>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.users.toLocaleString()}+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.emails.toLocaleString()}+</div>
                <div className="stat-label">Emails Generated</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.countries}+</div>
                <div className="stat-label">Countries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <section className="mission-section">
          <div className="section-header">
            <h2>Our Vision & Mission</h2>
            <p className="section-subtitle">Empowering digital privacy worldwide</p>
          </div>
          <div className="mission-content">
            <div className="vision-card">
              <div className="vision-icon">
                <i className="fa-solid fa-eye"></i>
              </div>
              <div className="vision-text">
                <h3>Our Vision</h3>
                <p>
                  To become the world's most trusted temporary email service, setting the standard 
                  for online privacy and security in the digital age.
                </p>
              </div>
            </div>
            <div className="mission-card">
              <div className="mission-icon">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div className="mission-text">
                <h3>Our Mission</h3>
                <p>
                  Enhance online privacy and security by offering a seamless, disposable email 
                  experience that keeps personal inboxes clutter-free and identities protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <div className="section-header">
            <h2>Why Choose Temp-MailHub?</h2>
            <p className="section-subtitle">Powerful features for your privacy needs</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                  <i className={feature.icon}></i>
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className="technology-section">
          <div className="section-header">
            <h2>Advanced Technology</h2>
            <p className="section-subtitle">Built on cutting-edge infrastructure</p>
          </div>
          <div className="technology-content">
            <div className="tech-description">
              <p>
                Temp-MailHub leverages state-of-the-art cloud technology to provide real-time email 
                access. Our system is engineered for exceptional speed, military-grade security, 
                and unmatched reliability.
              </p>
            </div>
            <div className="tech-stack">
              <h3>Our Technology Stack</h3>
              <div className="tech-list">
                {technologies.map((tech, index) => (
                  <div key={index} className="tech-item">
                    <i className="fa-solid fa-check"></i>
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Advertising Partners */}
        <section className="partners-section">
          <div className="section-header">
            <h2>Advertising Partners</h2>
            <p className="section-subtitle">Supporting free access through trusted partnerships</p>
          </div>
          <div className="partners-content">
            <div className="partners-intro">
              <p>
                To maintain free access to our premium services, we collaborate with industry-leading 
                advertising partners. These partnerships enable us to provide high-quality service 
                while keeping Temp-MailHub accessible to everyone.
              </p>
            </div>
            <div className="partners-grid">
              {advertisingPartners.map((partner, index) => (
                <div key={index} className="partner-card">
                  <div className="partner-icon">
                    <i className={partner.icon}></i>
                  </div>
                  <div className="partner-details">
                    <h3>{partner.name}</h3>
                    <p>{partner.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Commitment */}
        <section className="privacy-section">
          <div className="section-header">
            <h2>Our Privacy Commitment</h2>
            <p className="section-subtitle">Your anonymity is our promise</p>
          </div>
          <div className="privacy-content">
            <div className="privacy-card">
              <div className="privacy-icon">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <div className="privacy-text">
                <h3>Zero Data Storage</h3>
                <p>
                  We do not store any personal data, ensuring that your temporary emails remain 
                  truly anonymous and secure. Your privacy is non-negotiable.
                </p>
              </div>
            </div>
            <div className="values-grid">
              {values.map((value, index) => (
                <div key={index} className="value-item">
                  <div className="value-icon">
                    <i className={value.icon}></i>
                  </div>
                  <div className="value-text">
                    <h4>{value.title}</h4>
                    <p>{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Join Our Growing Community</h2>
              <p>
                Join thousands of users who trust Temp-MailHub for their temporary email needs. 
                Whether you need a quick disposable email or enhanced privacy, we've got you covered.
              </p>
              <div className="cta-tagline">
                <i className="fa-solid fa-lock"></i>
                <span>Stay private, stay secure with Temp-MailHub!</span>
              </div>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <i className="fa-solid fa-check"></i>
                <span>100% Free & Instant</span>
              </div>
              <div className="cta-feature">
                <i className="fa-solid fa-check"></i>
                <span>User-Friendly Interface</span>
              </div>
              <div className="cta-feature">
                <i className="fa-solid fa-check"></i>
                <span>Reliable & Secure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="about-footer">
          <div className="footer-content">
            <div className="company-info">
              <div className="company-logo">
                <i className="fa-solid fa-envelope"></i>
                <span>Temp-MailHub</span>
              </div>
              <p className="company-tagline">
                An innovative product by <strong>D-Tech Studios</strong>
              </p>
            </div>
            <div className="copyright">
              <p>
                <i className="fa-solid fa-copyright"></i>
                2025 D-Tech Studios. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
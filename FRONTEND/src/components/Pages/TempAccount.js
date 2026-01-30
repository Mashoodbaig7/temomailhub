import React, { useState, useRef } from "react";
import "./PagesCss/TempAccount.css";
import './PagesCss/f&q.css';

const faqs = [
  {
    id: 1,
    header: "What is a Temporary Account?",
    text: "A temporary account is a disposable account that allows you to generate a random username, full name, password, and email for temporary use. It is ideal for testing or quick sign-ups without using your personal credentials.",
  },
  {
    id: 2,
    header: "How long will my Temporary Account last?",
    text: "For free users, the temporary account lasts for 10 minutes before it is automatically deleted. Subscribers can create multiple accounts that last longer based on their plan.",
  },
  {
    id: 3,
    header: "Can I generate multiple accounts?",
    text: "Free users can generate only one temporary account at a time. Subscribers can generate and manage multiple temporary accounts based on their plan.",
  },
  {
    id: 4,
    header: "Can I delete my Temporary Account?",
    text: "Yes, you can manually delete your temporary account before it expires by clicking the 'Delete' button. Free accounts will be deleted automatically after 10 minutes.",
  },
  {
    id: 5,
    header: "Can I recover my Temporary Account after deletion?",
    text: "No, once a temporary account is deleted (either manually or automatically), it cannot be recovered. If needed, you can generate a new account.",
  },
  {
    id: 6,
    header: "How do I copy my account details?",
    text: "Each generated account has a 'Copy' button next to the username, full name, password, and email. Simply click the button to copy the information to your clipboard.",
  },
  {
    id: 7,
    header: "What happens if I don't delete my Temporary Account?",
    text: "If you are on the free plan, your account will automatically expire and be deleted after 10 minutes. Subscribers can keep accounts based on their plan duration.",
  },
  {
    id: 8,
    header: "Is my Temporary Account secure?",
    text: "Temporary accounts are randomly generated and not linked to your personal information, making them secure for temporary use. However, they should not be used for sensitive or important accounts.",
  },
  {
    id: 9,
    header: "Can I use a Temporary Account for verification?",
    text: "You can use a temporary account for sign-ups and verification on some websites. However, some platforms may block disposable accounts, so it might not work everywhere.",
  },
  {
    id: 10,
    header: "What additional benefits do subscribers get?",
    text: "Subscribers can create multiple accounts, extend the account lifespan, and manage accounts beyond the 10-minute limit of the free plan.",
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
          className={`rc-accordion-toggle p-3 ${
            active === id ? "active" : ""
          }`}
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

const TempAccount = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [copySuccess, setCopySuccess] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [active, setActive] = useState(null);

  // Toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Generate random data functions
  const generateRandomUsername = () => {
    const adjectives = ["Swift", "Mighty", "Clever", "Brave", "Golden", "Silent"];
    const nouns = ["Tiger", "Phoenix", "Wolf", "Eagle", "Dragon", "Panther"];
    const randomNum = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    setUsername(`${adj}${noun}${randomNum}`);
  };

  const generateRandomFullName = () => {
    const firstNames = ["Alexander", "Sophia", "Benjamin", "Charlotte", "William", "Amelia"];
    const lastNames = ["Robinson", "Chen", "Williams", "Kumar", "Garcia", "Tanaka"];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    setFullName(`${randomFirstName} ${randomLastName}`);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  const generateRandomEmail = () => {
    const domains = ["temp-mail.net", "dispostable.com", "guerrillamail.com", "mailinator.com"];
    const randomString = Math.random().toString(36).substring(2, 10);
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    setEmail(`${randomString}@${randomDomain}`);
  };

  // Generate all fields at once
  const generateAllFields = () => {
    generateRandomUsername();
    generateRandomFullName();
    generateRandomPassword();
    generateRandomEmail();
    showToastMessage("All fields generated successfully!");
  };

  // Add user card
  const addUserCard = () => {
    if (username && fullName && password && email) {
      const newUser = { 
        username, 
        fullName, 
        password, 
        email,
        createdAt: new Date().toLocaleTimeString()
      };
      setUsers([newUser, ...users]);
      showToastMessage("Account created successfully!");
      
      // Clear fields
      setUsername("");
      setFullName("");
      setPassword("");
      setEmail("");
    } else {
      showToastMessage("Please fill all fields before creating account!");
    }
  };

  // Delete user card
  const deleteUserCard = (index) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
    showToastMessage("Account deleted successfully!");
  };

  // Delete all user cards
  const deleteAllUserCards = () => {
    if (users.length > 0) {
      setUsers([]);
      showToastMessage("All accounts deleted successfully!");
    }
  };

  // Copy to clipboard with visual feedback
  const copyToClipboard = (text, field, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess({ [field + index]: true });
      showToastMessage(`${field} copied to clipboard!`);
      
      setTimeout(() => {
        setCopySuccess({ [field + index]: false });
      }, 2000);
    });
  };

  const handleToggle = (id) => {
    setActive(active === id ? null : id);
  };

  return (
    <div className="temp-account-page">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <i className="fa-solid fa-circle-check"></i>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <i className="fa-solid fa-user-clock hero-icon"></i>
            Temporary Account Generator
          </h1>
          <p className="hero-subtitle">
            Create secure, disposable accounts instantly with auto-expiry. Perfect for testing, verification, and temporary access.
          </p>
         
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        <div className="temp-account-wrapper">
          <div className="generator-section">
            <div className="section-header">
              <h2><i className="fa-solid fa-gear"></i> Account Generator</h2>
              <button onClick={generateAllFields} className="generate-all-btn">
                <i className="fa-solid fa-wand-magic-sparkles"></i> Generate All
              </button>
            </div>

            {/* Input Fields Grid */}
            <div className="input-grid">
              <div className="input-card">
                <label><i className="fa-solid fa-user"></i> Username</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Click generate or type custom username"
                  />
                  <button onClick={generateRandomUsername} className="generate-btn">
                    <i className="fa-solid fa-dice"></i> Generate
                  </button>
                </div>
              </div>

              <div className="input-card">
                <label><i className="fa-solid fa-id-card"></i> Full Name</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Click generate or type custom name"
                  />
                  <button onClick={generateRandomFullName} className="generate-btn">
                    <i className="fa-solid fa-dice"></i> Generate
                  </button>
                </div>
              </div>

              <div className="input-card">
                <label><i className="fa-solid fa-key"></i> Password</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Click generate or type custom password"
                  />
                  <button onClick={generateRandomPassword} className="generate-btn">
                    <i className="fa-solid fa-dice"></i> Generate
                  </button>
                </div>
              </div>

              <div className="input-card">
                <label><i className="fa-solid fa-envelope"></i> Email</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Click generate or type custom email"
                  />
                  <button onClick={generateRandomEmail} className="generate-btn">
                    <i className="fa-solid fa-dice"></i> Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={addUserCard} className="create-btn">
                <i className="fa-solid fa-plus-circle"></i> Create Account
              </button>
              
              {users.length > 0 && (
                <button onClick={deleteAllUserCards} className="delete-all-btn">
                  <i className="fa-solid fa-trash-can"></i> Clear All Accounts
                </button>
              )}
            </div>
          </div>

          {/* User Accounts Section */}
          {users.length > 0 && (
            <div className="accounts-section">
              <div className="section-header">
                <h2><i className="fa-solid fa-address-card"></i> Generated Accounts ({users.length})</h2>
              </div>
              
              <div className="accounts-grid">
                {users.map((user, index) => (
                  <div key={index} className="account-card">
                    <div className="account-header">
                      <div className="account-label">
                        <div className="account-icon">
                          <i className="fa-solid fa-user-tie"></i>
                        </div>
                        <div>
                          <h3>Account #{users.length - index}</h3>
                          <small>Created at {user.createdAt}</small>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteUserCard(index)} 
                        className="delete-account-btn"
                        title="Delete Account"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>

                    <div className="account-details">
                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fa-solid fa-image-portrait"></i>
                          <span>Username</span>
                        </div>
                        <div className="detail-value">
                          <code>{user.username}</code>
                          <button 
                            onClick={() => copyToClipboard(user.username, "Username", index)}
                            className={`copy-btn ${copySuccess[`Username${index}`] ? 'copied' : ''}`}
                          >
                            <i className="fa-solid fa-copy"></i>
                            {copySuccess[`Username${index}`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fa-solid fa-id-card"></i>
                          <span>Full Name</span>
                        </div>
                        <div className="detail-value">
                          <span>{user.fullName}</span>
                          <button 
                            onClick={() => copyToClipboard(user.fullName, "Full Name", index)}
                            className={`copy-btn ${copySuccess[`FullName${index}`] ? 'copied' : ''}`}
                          >
                            <i className="fa-solid fa-copy"></i>
                            {copySuccess[`FullName${index}`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fa-solid fa-lock"></i>
                          <span>Password</span>
                        </div>
                        <div className="detail-value">
                          <code className="password-display">{user.password}</code>
                          <button 
                            onClick={() => copyToClipboard(user.password, "Password", index)}
                            className={`copy-btn ${copySuccess[`Password${index}`] ? 'copied' : ''}`}
                          >
                            <i className="fa-solid fa-copy"></i>
                            {copySuccess[`Password${index}`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="detail-row">
                        <div className="detail-label">
                          <i className="fa-solid fa-envelope"></i>
                          <span>Email</span>
                        </div>
                        <div className="detail-value">
                          <span>{user.email}</span>
                          <button 
                            onClick={() => copyToClipboard(user.email, "Email", index)}
                            className={`copy-btn ${copySuccess[`Email${index}`] ? 'copied' : ''}`}
                          >
                            <i className="fa-solid fa-copy"></i>
                            {copySuccess[`Email${index}`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="container-fluid">
            <div className="row d-flex justify-content-center align-items-center">
              <div className="col-12 col-lg-10 col-xl-8">
                <div className="faq-card">
                  <div className="faq-header">
                    <h2  style={{ color: "white" }}><i className="fa-solid fa-circle-question"  ></i> Frequently Asked Questions</h2>
                    <p className="faq-subtitle"  style={{ color: "white" }}>Find quick answers to common questions about temporary accounts</p>
                  </div>
                  <div className="faq-body">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempAccount;
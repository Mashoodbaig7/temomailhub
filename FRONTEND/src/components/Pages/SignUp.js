import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../../services/api";
import { signInWithPopup } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "../../config/fireBase";
import { DEMO_ADMIN_CREDENTIALS } from "../../config/adminConfig";
import "./PagesCss/SignUp.css";

const SignUp = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    termsAccepted: false,
    profileImage: null, // For file upload
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Add global error handler to detect unhandled errors
  React.useEffect(() => {
    const handleError = (event) => {
      console.error('❌ [SignUp] Unhandled error detected:', event.error);
    };

    const handleUnhandledRejection = (event) => {
      console.error('❌ [SignUp] Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Toggle between login and signup
  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset form when toggling
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      termsAccepted: false,
      profileImage: null,
    });
    setErrors({});
    setImagePreview(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`📝 Input change: ${name} = ${value.substring(0, 20)}...`);
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  // Handle keydown to prevent unwanted submissions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      console.log('⌨️ Enter key pressed');
      // Only submit if it's the form element
      if (e.target.form) {
        e.preventDefault();
        e.target.form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'Please select a valid image file' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'Image size should be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, profileImage: file }));
      setErrors(prev => ({ ...prev, profileImage: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = "Username is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "You must accept the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 [SignUp] Form submission started');
    console.log('📝 [SignUp] Form data:', { email: formData.email, isLogin });

    if (!validateForm()) {
      console.log('❌ [SignUp] Form validation failed');
      return;
    }

    console.log('✅ [SignUp] Form validation passed');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // LOGIN API CALL
        console.log('📤 [SignUp] Attempting login...');
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        console.log('✅ [SignUp] Login response:', response);
        toast.success(response.message || "Login successful!");
        
        // Check if user is admin
        if (response.user && response.user.role === 'admin') {
          console.log('✅ Admin login successful');
          if(onLogin) onLogin();
          navigate('/admin/dashboard');
          return;
        }

        // Store user data if needed
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Trigger custom auth change event
        window.dispatchEvent(new Event('authChange'));
        window.dispatchEvent(new Event('storage'));

        // Redirect to home or dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 500);

      } else {
        // REGISTER API CALL
        const registerFormData = new FormData();
        registerFormData.append('name', formData.username);
        registerFormData.append('email', formData.email);
        registerFormData.append('password', formData.password);
        
        // Add image if selected, otherwise add empty string to satisfy backend
        if (formData.profileImage) {
          registerFormData.append('image', formData.profileImage);
        } else {
          // Send empty string for image if no file selected
          registerFormData.append('image', '');
        }

        console.log('Sending registration data:', {
          name: formData.username,
          email: formData.email,
          hasImage: !!formData.profileImage
        });

        const response = await authAPI.register(registerFormData);
        
        toast.success(response.message || "Account created successfully!");
        
        // Auto-login after successful registration
        if (response.token) {
          // Token already saved by authAPI.register
          
          // Store user data
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
          }

          // Trigger custom auth change event
          window.dispatchEvent(new Event('authChange'));
          window.dispatchEvent(new Event('storage'));

          // Show success message and redirect
          toast.success("Registration successful! Logging you in...");
          
          // Redirect to home page after 1 second
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          // If no token, switch to login form
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
            termsAccepted: false,
            profileImage: null,
          });
          setImagePreview(null);
          setPasswordStrength(0);
          setIsLogin(true);
        }
      }

    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `form-toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${
        type === "success" ? "fa-circle-check" : "fa-circle-exclamation"
      }"></i>
      <span>${message}</span>
    `;
    document.querySelector(".auth-container").appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Handle social login
  const handleSocialLogin = async (provider) => {
    if (provider === "Google") {
      try {
        setIsSubmitting(true);
        toast.info("Opening Google Sign-In...");

        // Get Firebase auth instances using getter functions
        const auth = getFirebaseAuth();
        const googleProvider = getGoogleProvider();

        // Sign in with Google using Firebase
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Prepare data to send to backend
        const googleData = {
          name: user.displayName,
          email: user.email,
          googleId: user.uid,
          profileImageUrl: user.photoURL || ""
        };

        // Send to backend to create/login user in MongoDB
        const response = await authAPI.googleAuth(googleData);

        toast.success(response.message || "Google Sign-In successful!");

        // Store user data
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Trigger custom auth change event
        window.dispatchEvent(new Event('authChange'));
        window.dispatchEvent(new Event('storage'));

        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 500);

      } catch (error) {
        console.error("Google Sign-In Error:", error);
        
        // Handle specific Firebase errors
        if (error.code === 'auth/popup-closed-by-user') {
          toast.info("Sign-in cancelled");
        } else if (error.code === 'auth/popup-blocked') {
          toast.error("Pop-up blocked. Please allow pop-ups for this site.");
        } else {
          const errorMessage = error.response?.data?.message || error.message || "Google Sign-In failed";
          toast.error(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.info(`${provider} sign-in coming soon!`);
    }
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (formData.password.length === 0) return "";
    const texts = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return texts[passwordStrength] || "";
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Hero Section */}
          <div className="auth-hero">
            <div className="hero-content">
              <h1 className="hero-title">Welcome Back</h1>
              <p className="hero-subtitle">
                <i className="fa-solid fa-shield-alt hero-icon"></i>
                {isLogin
                  ? "Sign in to access your account and manage your temporary emails"
                  : "Join us today and experience secure, disposable email service"}
              </p>
              <div className="hero-features">
                <div className="feature">
                  <i className="fa-solid fa-lock"></i>
                  <span>Secure & Private</span>
                </div>
                <div className="feature">
                  <i className="fa-solid fa-bolt"></i>
                  <span>Instant Setup</span>
                </div>
                <div className="feature">
                  <i className="fa-solid fa-infinity"></i>
                  <span>Unlimited Accounts</span>
                </div>
              </div>
            </div>
            <div className="hero-graphic">
              <div className="graphic-circle"></div>
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
          </div>

          {/* Form Section */}
          <div className="auth-form-section">
            {/* Form Header */}
            <div className="form-header">
              <div className="tab-switch">
                <button
                  className={`tab-btn ${isLogin ? "active" : ""}`}
                  onClick={() => setIsLogin(true)}
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  <span>Login</span>
                </button>
                <button
                  className={`tab-btn ${!isLogin ? "active" : ""}`}
                  onClick={() => setIsLogin(false)}
                >
                  <i className="fa-solid fa-user-plus"></i>
                  <span>Sign Up</span>
                </button>
                <div
                  className={`active-slider ${isLogin ? "login" : "signup"}`}
                ></div>
              </div>

              {/* Social Login */}
              <div className="social-auth">
                <p className="social-title">Continue with</p>
                <div className="social-buttons">
                  <button
                    className="social-btn google"
                    onClick={() => handleSocialLogin("Google")}
                  >
                    <i className="fab fa-google"></i>
                    <span>Google</span>
                  </button>
                
                </div>
              </div>

              <div className="divider">
                <span>or use email</span>
              </div>
            </div>

           

            {/* Form Content */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="username" style={{ color: "black" }}>
                    <i className="fa-solid fa-user"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className={errors.username ? "error" : ""}
                    autoComplete="username"
                  />
                  {errors.username && (
                    <span className="error-message">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.username}
                    </span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label
                  htmlFor="email"
                  className="label-email"
                  style={{ color: "black" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your email"
                  className={errors.email ? "error" : ""}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" style={{ color: "black" }}>
                  <i className="fa-solid fa-key"></i>
                  Password
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    className={errors.password ? "error" : ""}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`fa-solid ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {errors.password}
                  </span>
                )}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className={`strength-fill strength-${passwordStrength}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="strength-text">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword" style={{ color: "black" }}>
                      <i className="fa-solid fa-key"></i>
                      Confirm Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword ? "error" : ""}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <i
                          className={`fa-solid ${
                            showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  {/* Profile Image Upload */}
                  <div className="form-group">
                    <label htmlFor="profileImage" style={{ color: "black" }}>
                      <i className="fa-solid fa-image"></i>
                      Profile Image (Optional)
                    </label>
                    <div className="image-upload-wrapper">
                      <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="profileImage" className="image-upload-label">
                        {imagePreview ? (
                          <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                            <div className="image-overlay">
                              <i className="fa-solid fa-camera"></i>
                              <span>Change Image</span>
                            </div>
                          </div>
                        ) : (
                          <div className="image-placeholder">
                            <i className="fa-solid fa-cloud-upload-alt"></i>
                            <span>Upload Profile Image</span>
                            <small>Max 5MB (JPG, PNG, GIF)</small>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.profileImage && (
                      <span className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.profileImage}
                      </span>
                    )}
                  </div>

                  <div className="form-group terms-group">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="terms"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        className={errors.termsAccepted ? "error" : ""}
                      />
                      <label htmlFor="terms" className="terms-label" style={{ color:"black" }}>
                        I agree to the
                        <Link
                          to="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {" "}
                          Terms of Service
                        </Link>{" "}
                        and
                        <Link
                          to="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {" "}
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.termsAccepted && (
                      <span className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.termsAccepted}
                      </span>
                    )}
                  </div>
                </>
              )}

              {isLogin && (
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password">
                    <i className="fa-solid fa-question-circle"></i>
                    Forgot Password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log('🖱️ [SignUp] Button clicked');
                  if (isSubmitting) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="btn-content">
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <i
                        className={`fa-solid ${
                          isLogin ? "fa-right-to-bracket" : "fa-user-plus"
                        }`}
                      ></i>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    </>
                  )}
                </div>
                <div className="btn-gradient"></div>
              </button>

              {isLogin && (
                <div className="form-footer">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="switch-form"
                    onClick={toggleForm}
                  >
                    Sign up now
                  </button>
                </div>
              )}
            </form>

            {/* Security Note */}
            <div className="security-note">
              <i className="fa-solid fa-shield-halved"></i>
              <p>Your data is protected with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;















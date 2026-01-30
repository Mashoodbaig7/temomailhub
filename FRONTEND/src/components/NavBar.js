import React, { useState, useEffect, useContext, useRef } from 'react'; // useRef import karein
import { NavLink, useNavigate } from 'react-router-dom';
import './Pages/PagesCss/NavBar.css';
import gifLogo from '../components/assets/Favicon/logo.gif';
import authContext from '../context/AuthContext.js';
import { authAPI } from '../services/api';

const NavBar = () => {
  const [click, setClick] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);

  // Ref create karein dropdown ke liye
  const dropdownRef = useRef(null);

  const user = useContext(authContext);
  const navigate = useNavigate();

  const handleClick = () => setClick(!click);
  const Close = () => setClick(false);

  // Dropdown toggle handler
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // Close dropdown if clicked outside (Bahar click karne par band karne ke liye)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await authAPI.logout();
    setUserData(null);
    setShowDropdown(false);
    
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
    
    navigate('/sign');
  };

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      if (storedUser && token) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    };

    loadUserData();
    
    window.addEventListener('storage', loadUserData);
    window.addEventListener('authChange', loadUserData);
    
    return () => {
      window.removeEventListener('storage', loadUserData);
      window.removeEventListener('authChange', loadUserData);
    };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { path: '/', label: 'Temp Email', icon: <span role="img" aria-label="email">✉️</span> },
    { path: '/privateDomains', label: 'Domains', icon: <span role="img" aria-label="globe">🌐</span> },
    // { path: '/TempAccount', label: 'Temp Account', icon: <span role="img" aria-label="user">👤</span> },
    { path: '/contact', label: 'Contact', icon: <span role="img" aria-label="gear">⚙️</span> },
    { path: '/Pricing', label: 'Pricing', icon: <span role="img" aria-label="money bag">💰</span> },
    { path: '/Profile', label: 'Profile', icon: <span role="img" aria-label="gear">⚙️</span> },
  ];

  return (
    <>
      <div className={`nav-overlay ${click ? 'active' : ''}`} onClick={Close} />
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <NavLink to="/" className="nav-logo" onClick={Close}>
            <div className="logo-wrapper">
              <img src={gifLogo} alt="Temp-MailHub Logo" className="nav-logo-image" />
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text-wrapper">
              <h1 className="nav-logo-text">Temp-MailHub</h1>
            </div>
          </NavLink>

          <div className="nav-menu-wrapper">
            <ul className={click ? 'nav-menu active' : 'nav-menu'}>
              {menuItems.map((item, index) => {
                const isRestricted = ['Domains', 'Profile'].includes(item.label);

                return (isRestricted && !user && !userData) ? null : (
                  <li key={index} className="nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => "nav-links" + (isActive ? " active" : "")}
                      onClick={Close}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-underline"></span>
                    </NavLink>
                  </li>
                );
              })}

              {userData || user ? (
                // Changed: Ref added here and onClick instead of onHover
                <li className="nav-item nav-profile-item" ref={dropdownRef}>
                  <div 
                    className="user-profile-wrapper"
                    onClick={toggleDropdown} // Click logic
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="user-profile-trigger">
                      {userData?.profileImageUrl ? (
                        <img 
                          src={userData.profileImageUrl} 
                          alt={userData.name}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          <span>{userData?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                      )}
                      <span className="user-name">{userData?.name || 'User'}</span>
                      {/* Icon rotate logic */}
                      <i className={`fa-solid fa-chevron-down dropdown-icon ${showDropdown ? 'rotate' : ''}`}></i>
                    </div>

                    {showDropdown && (
                      <div className="user-dropdown">
                        <div className="dropdown-header">
                          <div className="dropdown-user-info">
                            {userData?.profileImageUrl ? (
                              <img src={userData.profileImageUrl} alt={userData.name} className="dropdown-avatar"/>
                            ) : (
                              <div className="dropdown-avatar-placeholder">
                                <span>{userData?.name?.charAt(0).toUpperCase() || 'U'}</span>
                              </div>
                            )}
                            <div className="dropdown-user-details">
                              <h4>{userData?.name || 'User'}</h4>
                              <p>{userData?.email || 'user@example.com'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <ul className="dropdown-menu">
                          <li>
                            <NavLink to="/profile" onClick={() => { Close(); setShowDropdown(false); }}>
                              <i className="fa-solid fa-user"></i>
                              <span>My Profile</span>
                            </NavLink>
                          </li>
                          {/* <li>
                            <NavLink to="/customDomains" onClick={() => { Close(); setShowDropdown(false); }}>
                              <i className="fa-solid fa-globe"></i>
                              <span>Custom Domains</span>
                            </NavLink>
                          </li> */}
                          <li>
                            <NavLink to="/subscription" onClick={() => { Close(); setShowDropdown(false); }}>
                              <i className="fa-solid fa-crown"></i>
                              <span>Subscription</span>
                            </NavLink>
                          </li>
                          <li>
                            <button onClick={handleLogout} className="logout-btn">
                              <i className="fa-solid fa-right-from-bracket"></i>
                              <span>Logout</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ) : (
                <li className="nav-item nav-button-item">
                  <NavLink to="/sign" className="sign-up-button" onClick={Close}>
                    <span className="button-text">🚀 SignUp/SignIn</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          <div className="nav-icon" onClick={handleClick}>
            <div className="hamburger">
              <span className={`bar ${click ? 'active' : ''}`}></span>
              <span className={`bar ${click ? 'active' : ''}`}></span>
              <span className={`bar ${click ? 'active' : ''}`}></span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;





// old code 



// import React, { useState, useEffect } from 'react';
// import { NavLink } from 'react-router-dom';
// import './Pages/PagesCss/NavBar.css';
// import gifLogo from '../components/assets/Favicon/logo.gif';

// const NavBar = () => {
//   const [click, setClick] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   const handleClick = () => setClick(!click);
//   const Close = () => setClick(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const menuItems = [
//     { path: '/', label: 'Temp Email', icon: <span role="img" aria-label="email">✉️</span> },
//     { path: '/privateDomains', label: 'Domains', icon: <span role="img" aria-label="globe">🌐</span> },
//     { path: '/TempAccount', label: 'Temp Account', icon: <span role="img" aria-label="user">👤</span> },
//     { path: '/Pricing', label: 'Pricing', icon: <span role="img" aria-label="money bag">💰</span> },
//     { path: '/Profile', label: 'Profile', icon: <span role="img" aria-label="gear">⚙️</span> },
//   ];

//   return (
//     <>
//       <div className={`nav-overlay ${click ? 'active' : ''}`} onClick={Close} />
//       <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
//         <div className="nav-container">
//           <NavLink 
//             to="/" 
//             className="nav-logo"
//             onClick={Close}
//           >
//             <div className="logo-wrapper">
//               <img 
//                 src={gifLogo} 
//                 alt="Temp-MailHub Logo" 
//                 className="nav-logo-image" 
//               />
//               <div className="logo-glow"></div>
//             </div>
//             <div className="logo-text-wrapper">
//               <h1 className="nav-logo-text">
//                 Temp-MailHub
//               </h1>
//               <span className="logo-subtitle">Secure & Temporary</span>
//             </div>
//           </NavLink>

//           <div className="nav-menu-wrapper">
//             <ul className={click ? 'nav-menu active' : 'nav-menu'}>
//               {menuItems.map((item, index) => (
//                 <li key={index} className="nav-item">
//                   <NavLink
//                     to={item.path}
//                     className={({ isActive }) => "nav-links" + (isActive ? " active" : "")}
//                     onClick={click ? handleClick : null}
//                   >
//                     <span className="nav-icon">{item.icon}</span>
//                     <span className="nav-label">{item.label}</span>
//                     <span className="nav-underline"></span>
//                   </NavLink>
//                 </li>
//               ))}
              
//               <li className="nav-item nav-button-item">
//                 <NavLink
//                   to="/sign"
//                   className={({ isActive }) => "sign-up-button" + (isActive ? " active" : "")}
//                   onClick={click ? handleClick : null}
//                 >
//                   <span className="button-content">
//                     <span className="button-icon"><span role="img" aria-label="rocket">🚀</span></span>
//                     <span className="button-text">SignUp/SignIn</span>
//                   </span>
//                   <span className="button-glow"></span>
//                 </NavLink>
//               </li>
//             </ul>
//           </div>

//           <div className="nav-icon" onClick={handleClick}>
//             <div className="hamburger">
//               <span className={`bar bar1 ${click ? 'active' : ''}`}></span>
//               <span className={`bar bar2 ${click ? 'active' : ''}`}></span>
//               <span className={`bar bar3 ${click ? 'active' : ''}`}></span>
//             </div>
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// };

// export default NavBar;






// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import NavBar from './components/NavBar';
// import Home from './components/Pages/Home';
// import TempAccount from './components/Pages/TempAccount';
// import Pricing from './components/Pages/Pricing';
// import Footer from './components/Footer';
// import SignUp from './components/Pages/SignUp';
// import Profile from './components/Pages/Profile';
// import PrivateDomains from './components/Pages/PrivateDomains';
// import AboutUs from './components/Pages/AboutUs';
// import ContentPolicy from './components/Pages/ContentPolicy';
// import PrivacyPolicy from './components/Pages/PrivacyPolicy';
// import TermsOfService from './components/Pages/TermsOfService';
// import Disclaimer from './components/Pages/Disclaimer';
// import Contact from './components/Pages/Contact';
// import AdminRouter from './admin/AdminRouter';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const authStatus = localStorage.getItem('isAdminAuthenticated');
//     if (authStatus === 'true') {
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//     localStorage.setItem('isAdminAuthenticated', 'true');
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     localStorage.removeItem('isAdminAuthenticated');
//   };

//   return (
//     <>
//       <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
//         <Routes>
//           <Route path="/admin/*" element={<AdminRouter isAuthenticated={isAuthenticated} onLogin={handleLogin} onLogout={handleLogout} />} />
//           <Route path="/*" element={
//             <>
//               <NavBar />
//               <div className="pages">
//                 <Routes>
//                   <Route exact path="/" element={<Home />} />
//                   <Route exact path="TempAccount" element={<TempAccount />} />
//                   <Route path="/pricing" element={<Pricing/>} />
//                   <Route path="/profile" element={<Profile/>} />
//                   <Route path="/sign" element={<SignUp onLogin={handleLogin} />} />
//                   <Route path="/privateDomains" element={<PrivateDomains/>} />
//                   <Route path="/about" element={<AboutUs/>} />
//                   <Route path="/content" element={<ContentPolicy/>} />
//                   <Route path="/privacy" element={<PrivacyPolicy/>} />
//                   <Route path="/terms" element={<TermsOfService/>} />
//                   <Route path="/disclaimer" element={<Disclaimer/>} />
//                   <Route path="/contact" element={<Contact/>} />
//                 </Routes>
//               </div>
//               <Footer />
//             </>
//           } />
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;




import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './components/NavBar';
import Home from './components/Pages/Home';
// import TempAccount from './components/Pages/TempAccount';
import Pricing from './components/Pages/Pricing';
import Footer from './components/Footer';
import SignUp from './components/Pages/SignUp';
import Profile from './components/Pages/Profile';
import SubscriptionManagement from './components/Pages/SubscriptionManagement';
import PrivateDomains from './components/Pages/PrivateDomains';
// import CustomDomains from './components/Pages/CustomDomains';
import AboutUs from './components/Pages/AboutUs';
import ContentPolicy from './components/Pages/ContentPolicy';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import TermsOfService from './components/Pages/TermsOfService';
import Disclaimer from './components/Pages/Disclaimer';
import Contact from './components/Pages/Contact';
import CheckoutSuccess from './components/Pages/CheckoutSuccess';
import AdminRouter from './admin/AdminRouter';
import authContext from './context/AuthContext.js';
// import ScrollToTop from '../src/components/scroll';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const user = useContext(authContext);


  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAdminAuthenticated', 'true');
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsAuthenticated(false);
    // Clear admin auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminUserId');
    localStorage.removeItem('adminPermissions');
  };

  return (
    <>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/admin/*" element={<AdminRouter onLogout={handleLogout} />} />
          <Route path="/*" element={
            <>
              <NavBar />
              <div className="pages">
                <Routes>
                  <Route exact path="/" element={<Home />} />
                  {/* <Route exact path="TempAccount" element={<TempAccount />} /> */}
                  {/* <Route exact path="TempAccount" element={<TempAccount />} /> */}
<Route exact path="/contact" element={<Contact />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />

                  {/* Ye routes secure hain: Agar user nahi hai to /sign par redirect honge */}
                  <Route path="/profile" element={user ? <Profile /> : <Navigate to="/sign" />} />
                  <Route path="/subscription" element={user ? <SubscriptionManagement /> : <Navigate to="/sign" />} />
                  <Route path="/privateDomains" element={user ? <PrivateDomains /> : <Navigate to="/sign" />} />
                  {/* <Route path="/customDomains" element={user ? <CustomDomains /> : <Navigate to="/sign" />} /> */}

                  {/* SignUp Button Condition: Agar user pehle se login hai to ye route / profile par bhej dega */}
                  <Route path="/sign" element={!user ? <SignUp onLogin={handleLogin} /> : <Navigate to="/" />} />

                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/content" element={<ContentPolicy />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </div>
              <Footer />
            </>
          } />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
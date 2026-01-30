import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManagePackages from './pages/ManagePackages';
import UsersManagement from './pages/UsersManagement';
import UserEmailAnalytics from './pages/UserEmailAnalytics';
import ContactSubmissions from './pages/ContactSubmissions';
import AdminProfile from './pages/AdminProfile';


const ProtectedRoute = ({ children }) => {
  // Check localStorage directly for authentication persistence on page refresh
  const authToken = localStorage.getItem('authToken');
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  
  if (!authToken || !isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminRouter = ({ onLogout }) => {
  return (
    <Routes>
      {/* Login route - accessible without authentication */}
      <Route path="login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout onLogout={onLogout}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="packages" element={<ManagePackages />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="analytics" element={<UserEmailAnalytics />} />
                <Route path="contact" element={<ContactSubmissions />} />
                <Route path="profile" element={<AdminProfile />} />
                
                <Route index element={<Navigate to="dashboard" />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRouter;

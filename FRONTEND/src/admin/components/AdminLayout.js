// AdminLayout.jsx - Enhanced
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './AdminLayout.css';

const AdminLayout = ({ children, onLogout }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`admin-panel-wrapper ${isMobile ? 'mobile-view' : ''} ${isSidebarCollapsed ? 'panel-collapsed' : ''} ${isSidebarOpen ? 'panel-sidebar-open' : ''}`}>
      <div className={`panel-overlay ${isSidebarOpen ? 'overlay-active' : ''}`} onClick={closeSidebar}></div>
      
      <Sidebar 
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onLogout={onLogout}
      />
      
      <main className="panel-main-container">
        <header className="panel-header-bar">
          <button className="panel-menu-toggle" onClick={toggleSidebar}>
            <span className="menu-toggle-line"></span>
            <span className="menu-toggle-line"></span>
            <span className="menu-toggle-line"></span>
          </button>
          <div className="panel-header-title">
            <h1>Dashboard</h1>
            <div className="panel-breadcrumb">Welcome back, Admin</div>
          </div>
        </header>
        
        <div className="panel-content-area" onClick={closeSidebar}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
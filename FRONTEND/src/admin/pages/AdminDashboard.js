// AdminDashboard.jsx - Light Theme with API Integration
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserTag,
  FaUserShield,
  FaUserNinja,
  FaEnvelopeOpenText,
  FaPaperPlane,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDollarSign,
  FaChartLine
} from "react-icons/fa";
import { toast } from 'react-toastify';
import { dashboardAPI } from "../../services/api";
import "./AdminDashboard.css";

const SummaryCard = ({ icon, title, value, percentage, trend, iconClass }) => (
  <div className="dashboard-summary-card">
    <div className="card-icon-circle">
      <div className={`icon-container ${iconClass}`}>
        {icon}
      </div>
    </div>
    <div className="card-content">
      <h3 className="card-value">{value}</h3>
      <p className="card-title">{title}</p>
      {percentage && (
        <div className={`card-trend ${trend}`}>
          {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, data, color }) => (
  <div className="dashboard-chart-card">
    <div className="chart-header">
      <h4 className="chart-title">{title}</h4>
      <button className="chart-action-btn">
        <FaFilter /> View Details
      </button>
    </div>
    <div className="chart-body">
      <div className="custom-bar-chart">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-item">
            <div className="bar-label">{item.label}</div>
            <div className="bar-container">
              <div 
                className="bar-fill" 
                style={{ 
                  height: `${item.value}%`,
                  background: color
                }}
              >
                <span className="bar-tooltip">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LineChartCard = ({ title, data, color }) => (
  <div className="dashboard-line-chart-card">
    <div className="chart-header">
      <h4 className="chart-title">{title}</h4>
      <div className="chart-legend">
        <span className="legend-item" style={{ color: color }}>
          ● Current Period
        </span>
      </div>
    </div>
    <div className="line-chart-body">
      <div className="line-chart-grid">
        {data.map((item, index) => (
          <div key={index} className="line-chart-point">
            <div 
              className="point" 
              style={{ 
                bottom: `${item.value}%`,
                background: color
              }}
            ></div>
            <div className="line" style={{ background: color }}></div>
            <div className="point-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      icon: <FaUsers />,
      title: "Total Users",
      value: dashboardData.summary.totalUsers.toLocaleString(),
      percentage: 12,
      trend: "up",
      iconClass: "icon-total"
    },
    {
      icon: <FaUserTag />,
      title: "Basic Users",
      value: dashboardData.summary.basicUsers.toLocaleString(),
      percentage: 8,
      trend: "up",
      iconClass: "icon-basic"
    },
    {
      icon: <FaUserShield />,
      title: "Standard Users",
      value: dashboardData.summary.standardUsers.toLocaleString(),
      percentage: 15,
      trend: "up",
      iconClass: "icon-standard"
    },
    {
      icon: <FaUserNinja />,
      title: "Premium Users",
      value: dashboardData.summary.premiumUsers.toLocaleString(),
      percentage: 25,
      trend: "up",
      iconClass: "icon-premium"
    },
    {
      icon: <FaEnvelopeOpenText />,
      title: "Emails Today",
      value: dashboardData.summary.emailsGeneratedToday.toLocaleString(),
      percentage: 18,
      trend: "up",
      iconClass: "icon-emails"
    },
    {
      icon: <FaPaperPlane />,
      title: "Free Emails",
      value: dashboardData.summary.freeEmailsGeneratedToday.toLocaleString(),
      percentage: 5,
      trend: "up",
      iconClass: "icon-free"
    }
  ];

  const barChartData = [
    { label: "Mon", value: 65 },
    { label: "Tue", value: 85 },
    { label: "Wed", value: 70 },
    { label: "Thu", value: 90 },
    { label: "Fri", value: 75 },
    { label: "Sat", value: 55 },
    { label: "Sun", value: 80 }
  ];

  const lineChartData = [
    { label: "Jan", value: 40 },
    { label: "Feb", value: 55 },
    { label: "Mar", value: 65 },
    { label: "Apr", value: 70 },
    { label: "May", value: 80 },
    { label: "Jun", value: 85 },
    { label: "Jul", value: 90 }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title" >Dashboard</h1>
          <p className="dashboard-subtitle">Welcome to your admin dashboard</p>
        </div>
        <div className="header-right">
          <div className="time-filter">
            <button 
              className={`filter-btn ${timeRange === 'daily' ? 'active' : ''}`}
              onClick={() => setTimeRange('daily')}
            >
              Daily
            </button>
            <button 
              className={`filter-btn ${timeRange === 'weekly' ? 'active' : ''}`}
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`filter-btn ${timeRange === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        {summaryCards.map((card, index) => (
          <SummaryCard key={index} {...card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* User Growth Chart */}
        <ChartCard 
          title="User Growth"
          data={barChartData}
          color="#56ab2f"
        />
        
        {/* Email Activity Chart */}
        <ChartCard 
          title="Email Activity"
          data={barChartData.map(item => ({ ...item, value: item.value - 10 }))}
          color="#2196f3"
        />
      </div>

      {/* Additional Metrics */}
      <div className="metrics-section">
        <LineChartCard 
          title="Revenue Trend"
          data={lineChartData}
          color="#9c27b0"
        />
        
        <div className="quick-stats-card">
          <div className="stats-header">
            <h4>Quick Stats</h4>
            <FaChartLine className="stats-icon" />
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#f44336' }}>
                <FaDollarSign />
              </div>
              <div className="stat-info">
                <h5>Revenue</h5>
                <p className="stat-value">$45,890</p>
                <span className="stat-trend up">+12%</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#ff9800' }}>
                <FaUsers />
              </div>
              <div className="stat-info">
                <h5>Active Users</h5>
                <p className="stat-value">2,845</p>
                <span className="stat-trend up">+8%</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#4caf50' }}>
                <FaEnvelopeOpenText />
              </div>
              <div className="stat-info">
                <h5>Open Rate</h5>
                <p className="stat-value">78.5%</p>
                <span className="stat-trend up">+3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
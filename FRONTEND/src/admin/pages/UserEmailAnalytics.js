// UserEmailAnalytics.jsx - Enhanced Version
import React from 'react';
import { 
  FaEnvelope, 
  FaChartLine, 
  FaUsers,
  FaUserCircle,
  FaCalendarAlt 
} from 'react-icons/fa';
import { emailAnalyticsSummary, userEmailActivity } from '../data/emailAnalyticsData';
import './UserEmailAnalytics.css';

const AnalyticsCard = ({ title, count, icon, color }) => (
  <div className="analytics-card">
    <div className="card-icon" style={{ backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
    <div className="card-content">
      <div className="count">{count.toLocaleString()}</div>
      <h3>{title}</h3>
    </div>
  </div>
);

const UserEmailAnalytics = () => {
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPlanColor = (emailCount) => {
    if (emailCount > 50) return '#9c27b0'; // Premium - purple
    if (emailCount > 20) return '#ff9800'; // Standard - orange
    return '#2196f3'; // Basic - blue
  };

  return (
    <div className="email-analytics-container">
      <div className="analytics-header">
        <div className="header-content">
          <h2>
            <FaChartLine className="header-icon" />
            User Email Analytics
          </h2>
          <p className="header-subtitle">Real-time email generation statistics</p>
        </div>
        <div className="header-info">
          <FaCalendarAlt />
          <span>Today's Data</span>
        </div>
      </div>

      <div className="analytics-summary-grid">
        <AnalyticsCard 
          title="Standard Users Emails"
          count={emailAnalyticsSummary.standardUsersEmails}
          icon={<FaUsers />}
          color="#ff9800"
        />
        <AnalyticsCard 
          title="Premium Users Emails"
          count={emailAnalyticsSummary.premiumUsersEmails}
          icon={<FaEnvelope />}
          color="#9c27b0"
        />
        <AnalyticsCard 
          title="Free Temp Users Emails"
          count={emailAnalyticsSummary.freeUsersEmails}
          icon={<FaUserCircle />}
          color="#2196f3"
        />
      </div>

      <div className="user-activity-section">
        <div className="section-header">
          <h3>
            <FaUsers className="section-icon" />
            Single User Email Activity (Today)
          </h3>
          <div className="section-stats">
            <span className="total-users">
              {userEmailActivity.length} Users
            </span>
          </div>
        </div>
        
        <div className="user-activity-table-container">
          <table className="user-activity-table">
            <thead>
              <tr>
                <th className="user-column">User</th>
                <th className="email-column">Emails Generated</th>
                <th className="status-column">Activity Level</th>
              </tr>
            </thead>
            <tbody>
              {userEmailActivity.map(activity => (
                <tr key={activity.id} className="user-activity-row">
                  <td className="user-cell">
                    <div className="user-info">
                      <div 
                        className="user-avatar"
                        style={{ backgroundColor: getPlanColor(activity.emailsGenerated) }}
                      >
                        {getInitials(activity.userName)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{activity.userName}</div>
                        <div className="user-type">{activity.userType || 'Standard User'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">
                    <div className="email-count-wrapper">
                      <div className="email-count">{activity.emailsGenerated}</div>
                      <div className="email-progress">
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: `${Math.min((activity.emailsGenerated / 100) * 100, 100)}%`,
                            backgroundColor: getPlanColor(activity.emailsGenerated)
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="status-cell">
                    <span className={`activity-status ${activity.emailsGenerated > 50 ? 'high' : activity.emailsGenerated > 20 ? 'medium' : 'low'}`}>
                      {activity.emailsGenerated > 50 ? 'High' : activity.emailsGenerated > 20 ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserEmailAnalytics;
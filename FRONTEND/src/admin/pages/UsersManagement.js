// UsersManagement.jsx - Enhanced with API Integration
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaCrown,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { toast } from 'react-toastify';
import { userAPI } from "../../services/api";
import "./UsersManagement.css";

const UserDetailsModal = ({ isOpen, onClose, user, onUpdateStatus }) => {

  if (!isOpen || !user) return null;

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanColor = (plan) => {
    const planColors = {
      Free: "#6B7280",
      Basic: "#3B82F6",
      Standard: "#F59E0B",
      Premium: "#8B5CF6",
    };
    return planColors[plan] || "#6B7280";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Active: "#10B981",
      Inactive: "#EF4444",
      Pending: "#F59E0B",
    };
    return statusColors[status] || "#6B7280";
  };

  return (
    <div
      className={`users-modal-overlay ${isOpen ? "modal-show" : ""}`}
      onClick={onClose}
    >
      <div className="users-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">User Profile</h2>
            <p className="modal-subtitle">View and manage user details</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>

        <div className="user-profile-content">
          <div className="user-avatar-section">
            <div
              className="user-avatar-circle"
              style={{
                background: `linear-gradient(135deg, ${getPlanColor(
                  user.currentPlan
                )}, ${getStatusColor(user.accountStatus)})`,
              }}
            >
              <span className="avatar-text">{getInitials(user.name)}</span>
            </div>
            <div className="user-badges">
              <span
                className="plan-badge"
                style={{
                  background: `${getPlanColor(user.currentPlan)}20`,
                  color: getPlanColor(user.currentPlan),
                }}
              >
                <FaCrown /> {user.currentPlan}
              </span>
              <span
                className="status-badge"
                style={{
                  background: `${getStatusColor(user.accountStatus)}20`,
                  color: getStatusColor(user.accountStatus),
                }}
              >
                {user.accountStatus === "Active" ? (
                  <FaCheckCircle />
                ) : (
                  <FaTimesCircle />
                )}
                {user.accountStatus}
              </span>
            </div>
          </div>

          <div className="user-info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <FaUser />
                </div>
                <div className="info-content">
                  <label className="info-label">Full Name</label>
                  <h3 className="info-value">{user.name}</h3>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-content">
                  <label className="info-label">Email Address</label>
                  <p className="info-value">{user.email}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaCalendarAlt />
                </div>
                <div className="info-content">
                  <label className="info-label">Joined Date</label>
                  <p className="info-value">{user.signupDate}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <FaCrown />
                </div>
                <div className="info-content">
                  <label className="info-label">Subscription Plan</label>
                  <div className="plan-selector">
                    <select
                      className="plan-select"
                      value={user.currentPlan}
                      onChange={(e) =>
                        onUpdateStatus(user.id, "plan", e.target.value)
                      }
                    >
                      <option value="Free">Free</option>
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="user-stats">
              <h4 className="stats-title">Account Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">45</div>
                  <div className="stat-label">Emails Generated</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">12</div>
                  <div className="stat-label">Active Sessions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">98%</div>
                  <div className="stat-label">Engagement Rate</div>
                </div>
              </div>
            </div>

            <div className="status-actions">
              <h4 className="actions-title">Account Status</h4>
              <div className="status-buttons">
                <button
                  className={`status-btn ${
                    user.accountStatus === "Active" ? "active" : ""
                  }`}
                  onClick={() => onUpdateStatus(user.id, "status", "Active")}
                >
                  <FaCheckCircle /> Active
                </button>
                <button
                  className={`status-btn ${
                    user.accountStatus === "Inactive" ? "inactive" : ""
                  }`}
                  onClick={() => onUpdateStatus(user.id, "status", "Inactive")}
                >
                  <FaTimesCircle /> Inactive
                </button>
                <button
                  className={`status-btn ${
                    user.accountStatus === "Pending" ? "pending" : ""
                  }`}
                  onClick={() => onUpdateStatus(user.id, "status", "Pending")}
                >
                  <FaCheckCircle /> Pending
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="footer-btn secondary-btn">
            Close
          </button>
          <button className="footer-btn primary-btn">
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, planFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (planFilter !== 'All') filters.plan = planFilter;

      const response = await userAPI.getAll(filters);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await userAPI.delete(id);
        if (response.success) {
          toast.success('User deleted successfully');
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleUpdateStatus = async (userId, type, value) => {
    try {
      const updateData = {};
      if (type === "status") {
        updateData.accountStatus = value;
      } else if (type === "plan") {
        updateData.currentPlan = value;
      }

      const response = await userAPI.update(userId, updateData);
      if (response.success) {
        toast.success('User updated successfully');
        fetchUsers();
        
        // Update selected user in modal
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) => ({
            ...prev,
            ...(type === "status" && { accountStatus: value }),
            ...(type === "plan" && { currentPlan: value }),
          }));
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortConfig.direction === "ascending") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    } else {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    }
  });

  const getPlanColor = (plan) => {
    const planColors = {
      Free: "#6B7280",
      Basic: "#3B82F6",
      Standard: "#F59E0B",
      Premium: "#8B5CF6",
    };
    return planColors[plan] || "#6B7280";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Active: "#10B981",
      Inactive: "#EF4444",
      Pending: "#F59E0B",
    };
    return statusColors[status] || "#6B7280";
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "ascending" ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading) {
    return (
      <div className="users-management-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management-container">
      <div className="users-header-section">
        <div className="header-content">
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage and monitor all user accounts</p>
        </div>
        
      </div>

      <div className="users-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="filter-select"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="All">All Plans</option>
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {sortedUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span role="img" aria-label="user icon">👤</span></div>
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="users-table-container">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    <div className="table-header-content">
                      User Name
                      <span className="sort-icon">{getSortIcon("name")}</span>
                    </div>
                  </th>
                  <th>Email Address</th>
                  <th onClick={() => handleSort("signupDate")}>
                    <div className="table-header-content">
                      Signup Date
                      <span className="sort-icon">
                        {getSortIcon("signupDate")}
                      </span>
                    </div>
                  </th>
                  <th>Current Plan</th>
                  <th onClick={() => handleSort("accountStatus")}>
                    <div className="table-header-content">
                      Status
                      <span className="sort-icon">
                        {getSortIcon("accountStatus")}
                      </span>
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td className="user-cell">
                      <div className="user-info">
                        <div
                          className="user-avatar-small"
                          style={{ background: getPlanColor(user.currentPlan) }}
                        >
                          <span>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-id">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td className="date-cell">
                      <div className="date-content">
                        <FaCalendarAlt className="date-icon" />
                        {user.signupDate}
                      </div>
                    </td>
                    <td className="plan-cell">
                      <span
                        className="plan-tag"
                        style={{
                          background: `${getPlanColor(user.currentPlan)}20`,
                          color: getPlanColor(user.currentPlan),
                        }}
                      >
                        <FaCrown className="plan-icon" />
                        {user.currentPlan}
                      </span>
                    </td>
                    <td className="status-cell">
                      <div className="status-indicator">
                        <span
                          className="status-dot"
                          style={{
                            background: getStatusColor(user.accountStatus),
                          }}
                        ></span>
                        <span className="status-text">
                          {user.accountStatus}
                        </span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="table-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => viewDetails(user)}
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        user={selectedUser}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default UsersManagement;



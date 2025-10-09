import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import "./EmployeeDashboard.css";
import Overview from "./Overview";
import UserManagement from "./UserManagement";
import TransactionManagement from "./TransactionManagement";

function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
    setEmployeeInfo(location.state);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/employee/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="bank-logo">
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
              <path d="M30 5L5 20H55L30 5Z" fill="#1976D2"/>
              <rect x="10" y="25" width="8" height="25" fill="#1976D2"/>
              <rect x="22" y="25" width="8" height="25" fill="#1976D2"/>
              <rect x="34" y="25" width="8" height="25" fill="#1976D2"/>
              <rect x="46" y="25" width="8" height="25" fill="#1976D2"/>
              <rect x="5" y="50" width="50" height="5" fill="#1976D2"/>
            </svg>
          </div>
          <h2>CAP Bank</h2>
          <p className="portal-label">Employee Portal</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            Overview
          </button>

          <button
            className={`nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            User Management
          </button>

          <button
            className={`nav-item ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
            </svg>
            Transactions
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="employee-profile">
            <div className="profile-avatar">
              {employeeInfo?.name?.charAt(0) || "E"}
            </div>
            <div className="profile-info">
              <p className="profile-name">{employeeInfo?.name || "Employee"}</p>
              <p className="profile-role">{employeeInfo?.department || "Staff"}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "users" && "User Management"}
            {activeTab === "transactions" && "Transaction Management"}
          </h1>
          <div className="header-actions">
            <span className="current-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === "overview" && <Overview stats={stats} />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "transactions" && <TransactionManagement />}
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
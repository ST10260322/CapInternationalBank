import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.clear();
  
    // Redirect to root (home)
    window.location.href = "https://localhost:3000/";
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="nav-icon active">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', width: '20px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '2px' }}></div>
          </div>
        </div>
        <div className="nav-icon">💵</div>
        <div className="nav-icon">💳</div>
        <div className="nav-icon">📊</div>
        <div className="nav-icon">👤</div>
        <div className="nav-icon logout-icon" style={{ marginTop: 'auto' }} onClick={handleLogout} title="Logout">
          🚪
        </div>
        <div className="nav-icon">⚙️</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="dashboard-icon">
              <div className="dashboard-icon-cell"></div>
              <div className="dashboard-icon-cell"></div>
              <div className="dashboard-icon-cell"></div>
              <div className="dashboard-icon-cell"></div>
            </div>
            <h1 className="header-title">Dashboard</h1>
          </div>
          <div className="bank-logo">
            <svg width="30" height="30" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 5L5 20H55L30 5Z" fill="white"/>
              <rect x="10" y="25" width="8" height="25" fill="white"/>
              <rect x="22" y="25" width="8" height="25" fill="white"/>
              <rect x="34" y="25" width="8" height="25" fill="white"/>
              <rect x="46" y="25" width="8" height="25" fill="white"/>
              <rect x="5" y="50" width="50" height="5" fill="white"/>
            </svg>
            <span>CAP International Bank</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div>
            {/* Account Overview */}
            <div className="card">
              <h2 className="card-title">Account Overview</h2>
              <div className="account-types">
                <div className="account-type">
                  <div className="account-label">Cheque</div>
                  <div className="account-balance">R5 560.00</div>
                </div>
                <div className="account-type">
                  <div className="account-label">Savings</div>
                  <div className="account-balance">R12 304.45</div>
                </div>
                <div className="account-type">
                  <div className="account-label">Credit</div>
                  <div className="account-balance">R2 345.00</div>
                </div>
              </div>

              {/* Recent Transactions */}
              <h3 className="card-title" style={{ marginTop: '30px' }}>Recent Transactions</h3>
              <div className="transactions-list">
                <div className="transaction-item">
                  <span className="transaction-date">11 Sept</span>
                  <span className="transaction-name">Deposit</span>
                  <span className="transaction-amount positive">+R1 200.00</span>
                </div>
                <div className="transaction-item">
                  <span className="transaction-date">11 Sept</span>
                  <span className="transaction-name">Withdrawal</span>
                  <span className="transaction-amount negative">-R 200.00</span>
                </div>
                <div className="transaction-item">
                  <span className="transaction-date">9 Sept</span>
                  <span className="transaction-name">Checkers</span>
                  <span className="transaction-amount negative">-R 75.00</span>
                </div>
                <div className="transaction-item">
                  <span className="transaction-date">6 Sept</span>
                  <span className="transaction-name">Cybersmart</span>
                  <span className="transaction-amount negative">-R 90.00</span>
                </div>
              </div>
            </div>

            {/* Cards & Payments */}
            <div className="card" style={{ marginTop: '30px' }}>
              <h2 className="card-title">Cards & Payments</h2>
              <div className="cards-section">
                <div className="credit-card">
                  <div className="card-chip"></div>
                  <div>
                    <div className="card-number">•••• •••• •••• 3009</div>
                    <div className="card-status">Active</div>
                  </div>
                </div>
                <div className="upcoming-payment">
                  <div className="payment-label">Upcoming Payment</div>
                  <div className="payment-amount">R280.00</div>
                  <div className="payment-date">25 Sept</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Quick Actions */}
            <div className="card">
              <h2 className="card-title">Quick Actions</h2>
              <div className="quick-actions-grid">
                <button className="action-btn" onClick={() => navigate("/payment", { state: { userId } })}>
                  Make Payment
                </button>
                <button className="action-btn" onClick={() => navigate("/bills", { state: { userId } })}>
                  Pay Bills
                </button>
                <button className="action-btn" onClick={() => navigate("/transfer", { state: { userId } })}>
                  Transfer Funds
                </button>
                <button className="action-btn" onClick={() => navigate("/balances", { state: { userId } })}>
                  Balances
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="card" style={{ marginTop: '30px' }}>
              <h2 className="card-title">Notifications</h2>
              <div className="notifications-list">
                <div className="notification-item">
                  <div className="notification-left">
                    <div className="notification-dot green"></div>
                    <span className="notification-text">Deposit</span>
                  </div>
                  <span className="notification-amount" style={{ color: '#22c55e' }}>+R1 200.00</span>
                </div>
                <div className="notification-item">
                  <div className="notification-left">
                    <div className="notification-dot red"></div>
                    <span className="notification-text">Withdrawal</span>
                  </div>
                  <span className="notification-amount" style={{ color: '#ef4444' }}>-R 200.00</span>
                </div>
                <div className="notification-item">
                  <div className="notification-left">
                    <div className="notification-dot red"></div>
                    <span className="notification-text">Checkers</span>
                  </div>
                  <span className="notification-amount" style={{ color: '#ef4444' }}>-R 75.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
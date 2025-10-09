import React from "react";
import "./Overview.css";

function Overview({ stats }) {
  if (!stats) {
    return <div>Loading statistics...</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="overview-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.users.total.toLocaleString()}</p>
            <span className="stat-label">Registered customers</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <p className="stat-number">{stats.transactions.approved}</p>
            <span className="stat-label">Transactions approved</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Pending Review</h3>
            <p className="stat-number">{stats.transactions.pending}</p>
            <span className="stat-label">Awaiting approval</span>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-number">{stats.transactions.rejected}</p>
            <span className="stat-label">Transactions rejected</span>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>Transaction Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Transactions</span>
              <span className="summary-value">{stats.transactions.total}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Value</span>
              <span className="summary-value">
                {formatCurrency(stats.transactions.totalAmount)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Amount</span>
              <span className="summary-value">
                {formatCurrency(stats.transactions.avgAmount)}
              </span>
            </div>
          </div>
          
          <div className="progress-bars">
            <div className="progress-item">
              <div className="progress-header">
                <span>Approved</span>
                <span>{((stats.transactions.approved / stats.transactions.total) * 100 || 0).toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill approved"
                  style={{ width: `${(stats.transactions.approved / stats.transactions.total) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-header">
                <span>Pending</span>
                <span>{((stats.transactions.pending / stats.transactions.total) * 100 || 0).toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill pending"
                  style={{ width: `${(stats.transactions.pending / stats.transactions.total) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-header">
                <span>Rejected</span>
                <span>{((stats.transactions.rejected / stats.transactions.total) * 100 || 0).toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill rejected"
                  style={{ width: `${(stats.transactions.rejected / stats.transactions.total) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => {
                const badge = getStatusBadge(activity.status);
                return (
                  <div key={activity._id} className="activity-item">
                    <div className="activity-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                      </svg>
                    </div>
                    <div className="activity-details">
                      <p className="activity-title">
                        {activity.recipientName} - {formatCurrency(activity.amount)} {activity.currency}
                      </p>
                      <p className="activity-meta">
                        {activity.userId?.name} {activity.userId?.surname} • {formatDate(activity.createdAt)}
                      </p>
                    </div>
                    <span className={`status-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
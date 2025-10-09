import React, { useState, useEffect } from "react";
import api from "../../api";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employee/users", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleViewUser = async (userId) => {
    try {
      const res = await api.get(`/employee/users/${userId}`);
      setSelectedUser(res.data);
      setShowUserDetails(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Search and Filters */}
      <div className="management-header">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or ID number..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="refresh-btn" onClick={fetchUsers}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>ID Number</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.name.charAt(0)}{user.surname.charAt(0)}
                      </div>
                      <span>{user.name} {user.surname}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.idNumber}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewUser(user._id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button 
                className="close-btn"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* User Info */}
              <div className="user-details-section">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">
                      {selectedUser.user.name} {selectedUser.user.surname}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedUser.user.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">ID Number</span>
                    <span className="detail-value">{selectedUser.user.idNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registered</span>
                    <span className="detail-value">
                      {formatDate(selectedUser.user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Stats */}
              <div className="user-details-section">
                <h3>Transaction Statistics</h3>
                <div className="stats-grid-small">
                  <div className="stat-item">
                    <span className="stat-value">{selectedUser.stats.totalTransactions}</span>
                    <span className="stat-label">Total Transactions</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{selectedUser.stats.pendingCount}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{selectedUser.stats.approvedCount}</span>
                    <span className="stat-label">Approved</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{selectedUser.stats.rejectedCount}</span>
                    <span className="stat-label">Rejected</span>
                  </div>
                </div>
                <div className="total-amount">
                  <span className="amount-label">Total Transaction Value:</span>
                  <span className="amount-value">
                    {formatCurrency(selectedUser.stats.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="user-details-section">
                <h3>Recent Transactions</h3>
                {selectedUser.transactions.length > 0 ? (
                  <div className="transactions-list">
                    {selectedUser.transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction._id} className="transaction-item-small">
                        <div className="transaction-info">
                          <p className="transaction-recipient">{transaction.recipientName}</p>
                          <p className="transaction-meta">
                            {transaction.bank} • {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="transaction-right">
                          <p className="transaction-amount">
                            {formatCurrency(transaction.amount)} {transaction.currency}
                          </p>
                          <span className={`status-badge status-${transaction.status}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-transactions">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
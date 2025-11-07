import React, { useState, useEffect } from "react";
import api from "../../api";
import toast from 'react-hot-toast';
import "./TransactionManagement.css";

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employee/transactions", {
        params: {
          page: currentPage,
          limit: 15,
          status: statusFilter,
          search: searchTerm,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = async (transactionId) => {
    try {
      const res = await api.get(`/employee/transactions/${transactionId}`);
      setSelectedTransaction(res.data.transaction);
      setShowTransactionDetails(true);
      setComment("");
    } catch (err) {
      console.error("Error fetching transaction details:", err);
      toast.error("Failed to load transaction details");
    }
  };

  const handleApprove = async () => {
    if (!selectedTransaction) return;
    
    setActionLoading(true);
    const toastId = toast.loading('Processing transaction approval...');
    
    try {
      await api.post(`/employee/transactions/${selectedTransaction._id}/approve`, {
        comment: comment || undefined  // Only send comment if provided
      });
      
      toast.success('✅ Transaction approved successfully!', {
        id: toastId,
      });
      
      // Close modal and refresh
      setShowTransactionDetails(false);
      setSelectedTransaction(null);
      setComment("");
      fetchTransactions();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(err.response?.data?.message || '❌ Failed to approve transaction', {
        id: toastId,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    
    // Validate comment is required for rejection
    if (!comment || comment.trim() === "") {
      toast.error("Comment is required for rejecting a transaction");
      return;
    }
    
    setActionLoading(true);
    const toastId = toast.loading('Processing transaction rejection...');
    
    try {
      await api.post(`/employee/transactions/${selectedTransaction._id}/reject`, {
        comment: comment
      });
      
      toast.success('✅ Transaction rejected successfully!', {
        id: toastId,
      });
      
      // Close modal and refresh
      setShowTransactionDetails(false);
      setSelectedTransaction(null);
      setComment("");
      fetchTransactions();
    } catch (err) {
      console.error("Rejection error:", err);
      toast.error(err.response?.data?.message || '❌ Failed to reject transaction', {
        id: toastId,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending', color: '#FF9800' },
      approved: { class: 'status-approved', text: 'Approved', color: '#4CAF50' },
      rejected: { class: 'status-rejected', text: 'Rejected', color: '#F44336' }
    };
    return badges[status] || badges.pending;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="transaction-management">
      {/* Filters and Search */}
      <div className="management-header">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
          >
            All
          </button>
          <button
            className={`filter-tab ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${statusFilter === "approved" ? "active" : ""}`}
            onClick={() => { setStatusFilter("approved"); setCurrentPage(1); }}
          >
            Approved
          </button>
          <button
            className={`filter-tab ${statusFilter === "rejected" ? "active" : ""}`}
            onClick={() => { setStatusFilter("rejected"); setCurrentPage(1); }}
          >
            Rejected
          </button>
        </div>

        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Recipient</th>
              <th>Bank</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const badge = getStatusBadge(transaction.status);
                return (
                  <tr key={transaction._id}>
                    <td>{formatDate(transaction.createdAt)}</td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {transaction.userId?.name?.charAt(0)}
                        </div>
                        <div className="customer-info">
                          <p className="customer-name">
                            {transaction.userId?.name} {transaction.userId?.surname}
                          </p>
                          <p className="customer-email">{transaction.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="recipient-info">
                        <p className="recipient-name">{transaction.recipientName}</p>
                        <p className="recipient-email">{transaction.recipientEmail}</p>
                      </div>
                    </td>
                    <td>{transaction.bank}</td>
                    <td className="amount-cell">
                      <span className="amount">
                        {formatCurrency(transaction.amount)}
                      </span>
                      <span className="currency">{transaction.currency}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${badge.class}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewTransaction(transaction._id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No transactions found
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

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowTransactionDetails(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button 
                className="close-btn"
                onClick={() => setShowTransactionDetails(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Status Banner */}
              <div className={`status-banner status-banner-${selectedTransaction.status}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  {selectedTransaction.status === 'pending' && (
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  )}
                  {selectedTransaction.status === 'approved' && (
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  )}
                  {selectedTransaction.status === 'rejected' && (
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  )}
                </svg>
                <span>Transaction {selectedTransaction.status.toUpperCase()}</span>
              </div>

              {/* Transaction Info Grid */}
              <div className="details-section">
                <h3>Transaction Information</h3>
                <div className="details-grid-two-col">
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID</span>
                    <span className="detail-value mono">{selectedTransaction._id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date & Time</span>
                    <span className="detail-value">{formatDate(selectedTransaction.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value highlight">
                      {formatCurrency(selectedTransaction.amount)} {selectedTransaction.currency}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${getStatusBadge(selectedTransaction.status).class}`}>
                      {getStatusBadge(selectedTransaction.status).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="details-section">
                <h3>Customer Information</h3>
                <div className="details-grid-two-col">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">
                      {selectedTransaction.userId?.name} {selectedTransaction.userId?.surname}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedTransaction.userId?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">ID Number</span>
                    <span className="detail-value mono">{selectedTransaction.userId?.idNumber}</span>
                  </div>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="details-section">
                <h3>Recipient Information</h3>
                <div className="details-grid-two-col">
                  <div className="detail-item">
                    <span className="detail-label">Recipient Name</span>
                    <span className="detail-value">{selectedTransaction.recipientName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Recipient Email</span>
                    <span className="detail-value">{selectedTransaction.recipientEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bank</span>
                    <span className="detail-value">{selectedTransaction.bank}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Number</span>
                    <span className="detail-value mono">{selectedTransaction.accountNumber}</span>
                  </div>
                  {selectedTransaction.swiftCode && (
                    <div className="detail-item">
                      <span className="detail-label">SWIFT Code</span>
                      <span className="detail-value mono">{selectedTransaction.swiftCode}</span>
                    </div>
                  )}
                  {selectedTransaction.reference && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Reference</span>
                      <span className="detail-value">{selectedTransaction.reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Info (if reviewed) */}
              {selectedTransaction.reviewedBy && (
                <div className="details-section">
                  <h3>Review Information</h3>
                  <div className="details-grid-two-col">
                    <div className="detail-item">
                      <span className="detail-label">Reviewed By</span>
                      <span className="detail-value">
                        {selectedTransaction.reviewedBy?.name} {selectedTransaction.reviewedBy?.surname}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Review Date</span>
                      <span className="detail-value">{formatDate(selectedTransaction.reviewedAt)}</span>
                    </div>
                    {selectedTransaction.reviewComment && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Comment</span>
                        <span className="detail-value">{selectedTransaction.reviewComment}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Section (only for pending transactions) */}
              {selectedTransaction.status === 'pending' && (
                <div className="action-section">
                  <h3>Review Action</h3>
                  <div className="comment-box">
                    <label>Comment <span className="optional">(optional for approval, required for rejection)</span></label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment about this transaction..."
                      rows="4"
                    />
                  </div>
                  <div className="action-buttons">
                    <button
                      className="approve-btn"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "✓ Approve Transaction"}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={handleReject}
                      disabled={actionLoading || !comment.trim()}
                    >
                      {actionLoading ? "Processing..." : "✕ Reject Transaction"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionManagement;
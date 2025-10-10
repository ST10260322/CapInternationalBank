import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./ConfirmPayment.css";

function ConfirmPayment({ prevStep, data }) {
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await api.post("/payments", {
        recipientName: data.recipientName,
        bank: data.bank,
        accountNumber: data.accountNumber,
        recipientEmail: data.email,
        currency: data.currency,
        amount: data.amount,
        reference: data.reference,
        swiftCode: data.swiftCode
      });
      alert("Payment confirmed and saved!");
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Error saving payment");
    }
  };

  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to start over? All entered data will be lost.")) {
      navigate("/payment");
    }
  };

  return (
    <div className="confirm-payment-container">
      {/* Bank Header */}
      <div className="bank-header">
        <div className="bank-icon">🏛️</div>
        <span>CAP International Bank</span>
      </div>

      {/* Confirmation Container */}
      <div className="confirmation-wrapper">
        <h2>Payment Confirmation</h2>
        
        <div className="details-grid">
          {/* Left Column */}
          <div className="detail-item">
            <span className="detail-label">Recipient Name</span>
            <div className="detail-value">{data.recipientName}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">Currency</span>
            <div className="detail-value">{data.currency}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">Recipient Bank</span>
            <div className="detail-value">{data.bank}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">Amount</span>
            <div className="detail-value">R {parseFloat(data.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">Account Number</span>
            <div className="detail-value">{data.accountNumber}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">Reference</span>
            <div className="detail-value">{data.reference || 'N/A'}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">Recipient Email</span>
            <div className="detail-value">{data.email}</div>
          </div>

          <div className="detail-item">
            <span className="detail-label">SWIFT Code</span>
            <div className="detail-value swift-code">••••••••••</div>
          </div>
        </div>

        <div className="button-container">
          <button className="start-over-button" onClick={handleStartOver}>
            Start Over
          </button>
          <button className="send-button" onClick={handleConfirm}>
            Send
          </button>
        </div>

        <div className="footer-text">
          Protected by Rate Limiting
        </div>
      </div>
    </div>
  );
}

export default ConfirmPayment;
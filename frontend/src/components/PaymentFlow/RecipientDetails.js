import React, { useState } from "react";
import "./RecipientDetails.css"; // Import the CSS file

function RecipientDetails({ nextStep, updateData, data }) {
  const [form, setForm] = useState({
    recipientName: data.recipientName || "",
    bank: data.bank || "",
    accountNumber: data.accountNumber || "",
    email: data.email || ""
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    updateData(form);
    nextStep();
  };

  return (
    <div className="recipient-details-container">
      {/* Bank Header */}
      <div className="bank-header">
        <div className="bank-icon">🏛️</div>
        <span>CAP International Bank</span>
      </div>

      {/* Form Container */}
      <div className="form-wrapper">
        <h2>Recipient Details</h2>
        
        <form className="recipient-form" onSubmit={handleNext}>
          <div className="form-group">
            <label htmlFor="recipientName">Recipient Name</label>
            <input 
              name="recipientName" 
              id="recipientName"
              placeholder="Mary" 
              value={form.recipientName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="bank">Recipient Bank</label>
            <input 
              name="bank" 
              id="bank"
              placeholder="Standard Bank" 
              value={form.bank} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Recipient Account Number</label>
            <input 
              name="accountNumber" 
              id="accountNumber"
              placeholder="000 000 0000" 
              value={form.accountNumber} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Recipient Email</label>
            <input 
              name="email" 
              id="email"
              placeholder="maryjane@gmail.com" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="next-button">Next</button>
        </form>
      </div>
    </div>
  );
}

export default RecipientDetails;
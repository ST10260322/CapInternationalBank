import React, { useState } from "react";
import "./AmountDetails.css";

function AmountDetails({ nextStep, prevStep, updateData, data }) {
  const [form, setForm] = useState({
    currency: data.currency || "",
    amount: data.amount || "",
    reference: data.reference || "",
    swiftCode: data.swiftCode || ""
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
    <div className="amount-details-container">
      {/* Bank Header */}
      <div className="bank-header">
        <div className="bank-icon">🏛️</div>
        <span>CAP International Bank</span>
      </div>

      {/* Form Container */}
      <div className="form-wrapper">
        <h2>Amount Details</h2>
        
        <form className="amount-form" onSubmit={handleNext}>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <input 
              name="currency" 
              id="currency"
              placeholder="South African Rands (ZAR)" 
              value={form.currency} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input 
              name="amount" 
              id="amount"
              placeholder="R1 000" 
              type="number"
              value={form.amount} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="reference">Reference</label>
            <input 
              name="reference" 
              id="reference"
              placeholder="Food" 
              value={form.reference} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="swiftCode">SWIFT Code</label>
            <input 
              name="swiftCode" 
              id="swiftCode"
              placeholder="••••••••••" 
              value={form.swiftCode} 
              onChange={handleChange} 
            />
          </div>

          <div className="button-container">
            <button type="button" className="back-button" onClick={prevStep}>
              Back
            </button>
            <button type="submit" className="next-button">
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AmountDetails;
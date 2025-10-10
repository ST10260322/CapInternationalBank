import React, { useState } from "react";
import "./AmountDetails.css";

function AmountDetails({ nextStep, prevStep, updateData, data }) {
  const [form, setForm] = useState({
    currency: data.currency || "",
    amount: data.amount || "",
    reference: data.reference || "",
    swiftCode: data.swiftCode || ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch(name) {
      case 'currency':
        if (!value) return 'Currency is required';
        if (value.length < 3) return 'Currency code must be at least 3 characters (e.g., ZAR, USD)';
        if (!/^[A-Z]{3}$/i.test(value.trim())) return 'Use 3-letter currency code (e.g., ZAR, USD, EUR)';
        return '';
      
      case 'amount':
        if (!value) return 'Amount is required';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'Amount must be a valid number';
        if (numValue <= 0) return 'Amount must be greater than 0';
        if (numValue > 1000000) return 'Amount cannot exceed R1,000,000';
        return '';
      
      case 'reference':
        if (value && value.length > 50) return 'Reference must be 50 characters or less';
        return '';
      
      case 'swiftCode':
        if (!value) return 'SWIFT code is required';
        const cleanedSwift = value.trim().toUpperCase();
        if (!/^[A-Z]{8}([A-Z0-9]{3})?$/.test(cleanedSwift)) {
          return 'SWIFT code must be 8 or 11 characters (letters and numbers)';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({...form, [name]: value });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({...errors, [name]: error});
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({...touched, [name]: true});
    const error = validateField(name, value);
    setErrors({...errors, [name]: error});
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        currency: true,
        amount: true,
        reference: true,
        swiftCode: true
      });
      return;
    }

    updateData(form);
    nextStep();
  };

  return (
    <div className="amount-details-container">
      <div className="bank-header">
        <div className="bank-icon">🏛️</div>
        <span>CAP International Bank</span>
      </div>

      <div className="form-wrapper">
        <h2>Amount Details</h2>
        
        <form className="amount-form" onSubmit={handleNext}>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <input 
              name="currency" 
              id="currency"
              placeholder="ZAR" 
              value={form.currency} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.currency && touched.currency ? 'error' : ''}
              maxLength="3"
              required 
            />
            <span className="helper-text">3-letter code: ZAR, USD, EUR, GBP</span>
            {errors.currency && touched.currency && (
              <span className="error-text">{errors.currency}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input 
              name="amount" 
              id="amount"
              placeholder="1000.00" 
              type="number"
              step="0.01"
              value={form.amount} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.amount && touched.amount ? 'error' : ''}
              required 
            />
            <span className="helper-text">Maximum: R1,000,000</span>
            {errors.amount && touched.amount && (
              <span className="error-text">{errors.amount}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reference">Reference (Optional)</label>
            <input 
              name="reference" 
              id="reference"
              placeholder="Food" 
              value={form.reference} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.reference && touched.reference ? 'error' : ''}
              maxLength="50"
            />
            <span className="helper-text">Max 50 characters</span>
            {errors.reference && touched.reference && (
              <span className="error-text">{errors.reference}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="swiftCode">SWIFT Code</label>
            <input 
              name="swiftCode" 
              id="swiftCode"
              placeholder="SBZAZAJJ" 
              value={form.swiftCode} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.swiftCode && touched.swiftCode ? 'error' : ''}
              maxLength="11"
              required 
            />
            <span className="helper-text">8 or 11 characters (e.g., SBZAZAJJ)</span>
            {errors.swiftCode && touched.swiftCode && (
              <span className="error-text">{errors.swiftCode}</span>
            )}
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
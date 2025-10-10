import React, { useState } from "react";
import "./RecipientDetails.css";

function RecipientDetails({ nextStep, updateData, data }) {
  const [form, setForm] = useState({
    recipientName: data.recipientName || "",
    bank: data.bank || "",
    accountNumber: data.accountNumber || "",
    email: data.email || ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch(name) {
      case 'recipientName':
        if (!value) return 'Recipient name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
      
      case 'bank':
        if (!value) return 'Bank name is required';
        if (value.length < 3) return 'Bank name must be at least 3 characters';
        return '';
      
      case 'accountNumber':
        if (!value) return 'Account number is required';
        const cleanedAccount = value.replace(/\s/g, '');
        if (!/^\d+$/.test(cleanedAccount)) return 'Account number must contain only digits';
        if (cleanedAccount.length < 8 || cleanedAccount.length > 16) return 'Account number must be 8-16 digits';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
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
        recipientName: true,
        bank: true,
        accountNumber: true,
        email: true
      });
      return;
    }

    updateData(form);
    nextStep();
  };

  return (
    <div className="recipient-details-container">
      <div className="bank-header">
        <div className="bank-icon">🏛️</div>
        <span>CAP International Bank</span>
      </div>

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
              onBlur={handleBlur}
              className={errors.recipientName && touched.recipientName ? 'error' : ''}
              required 
            />
            <span className="helper-text">Letters only, 2+ characters</span>
            {errors.recipientName && touched.recipientName && (
              <span className="error-text">{errors.recipientName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bank">Recipient Bank</label>
            <input 
              name="bank" 
              id="bank"
              placeholder="Standard Bank" 
              value={form.bank} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.bank && touched.bank ? 'error' : ''}
              required 
            />
            <span className="helper-text">Bank name, 3+ characters</span>
            {errors.bank && touched.bank && (
              <span className="error-text">{errors.bank}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Recipient Account Number</label>
            <input 
              name="accountNumber" 
              id="accountNumber"
              placeholder="000 000 0000" 
              value={form.accountNumber} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.accountNumber && touched.accountNumber ? 'error' : ''}
              required 
            />
            <span className="helper-text">8-16 digits, spaces allowed</span>
            {errors.accountNumber && touched.accountNumber && (
              <span className="error-text">{errors.accountNumber}</span>
            )}
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
              onBlur={handleBlur}
              className={errors.email && touched.email ? 'error' : ''}
              required 
            />
            <span className="helper-text">Valid email format required</span>
            {errors.email && touched.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <button type="submit" className="next-button">Next</button>
        </form>
      </div>
    </div>
  );
}

export default RecipientDetails;
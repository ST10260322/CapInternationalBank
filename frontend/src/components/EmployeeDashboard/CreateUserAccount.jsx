import React, { useState } from "react";
import api from "../../api";
import "./CreateUserAccount.css";

function CreateUserAccount({ onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    idNumber: "",
    email: "",
    password: ""
  });
  
  const [createdUser, setCreatedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation states
  const [nameValid, setNameValid] = useState(false);
  const [surnameValid, setSurnameValid] = useState(false);
  const [idValid, setIdValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");

    // Real-time validation
    switch(name) {
      case 'name':
        setNameValid(value.length > 0 && /^[A-Za-z\s]+$/.test(value));
        break;
      case 'surname':
        setSurnameValid(value.length > 0 && /^[A-Za-z\s]+$/.test(value));
        break;
      case 'idNumber':
        const numericId = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, idNumber: numericId }));
        setIdValid(numericId.length === 13);
        break;
      case 'email':
        setEmailValid(value.includes('@') && value.includes('.'));
        break;
      case 'password':
        setPasswordValid(
          value.length >= 8 &&
          /[A-Z]/.test(value) &&
          /[a-z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[@$!%*?&#]/.test(value)
        );
        break;
      default:
        break;
    }
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '@$!%*?&#';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const all = uppercase + lowercase + numbers + special;
    for (let i = 4; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ ...prev, password }));
    setPasswordValid(true);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/employee/create-user", formData);
      setCreatedUser(response.data.user);
      if (onUserCreated) onUserCreated(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user account");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    alert(`${field} copied to clipboard!`);
  };

  const printCredentials = () => {
    window.print();
  };

  if (createdUser) {
    return (
      <div className="create-user-success">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h2>Account Created Successfully!</h2>
          <p className="success-subtitle">Provide these credentials to the customer</p>
        </div>

        <div className="credentials-card" id="printable-credentials">
          <div className="credentials-header">
            <h3>Customer Account Credentials</h3>
            <p className="credentials-date">Created: {new Date(createdUser.createdAt).toLocaleString()}</p>
          </div>

          <div className="credential-item">
            <label>Account Holder Name</label>
            <div className="credential-value">
              <span>{createdUser.name} {createdUser.surname}</span>
              <button onClick={() => copyToClipboard(`${createdUser.name} ${createdUser.surname}`, 'Name')}>
                📋 Copy
              </button>
            </div>
          </div>

          <div className="credential-item">
            <label>Email Address</label>
            <div className="credential-value">
              <span>{createdUser.email}</span>
              <button onClick={() => copyToClipboard(createdUser.email, 'Email')}>
                📋 Copy
              </button>
            </div>
          </div>

          <div className="credential-item highlight">
            <label>Account Number</label>
            <div className="credential-value">
              <span className="account-number">{createdUser.accountNumber}</span>
              <button onClick={() => copyToClipboard(createdUser.accountNumber, 'Account Number')}>
                📋 Copy
              </button>
            </div>
          </div>

          <div className="credential-item highlight">
            <label>Temporary Password</label>
            <div className="credential-value">
              <span className="password">{createdUser.temporaryPassword}</span>
              <button onClick={() => copyToClipboard(createdUser.temporaryPassword, 'Password')}>
                📋 Copy
              </button>
            </div>
          </div>

          <div className="security-notice">
            <strong>⚠️ Important Security Notice:</strong>
            <p>The customer should change their password immediately after first login.</p>
            <p>This password will not be shown again.</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="print-btn" onClick={printCredentials}>
            🖨️ Print Credentials
          </button>
          <button className="copy-all-btn" onClick={() => {
            const text = `
CAP International Bank - New Account Credentials

Name: ${createdUser.name} ${createdUser.surname}
Email: ${createdUser.email}
Account Number: ${createdUser.accountNumber}
Temporary Password: ${createdUser.temporaryPassword}

Please change your password after first login.
            `;
            copyToClipboard(text, 'All Credentials');
          }}>
            📋 Copy All
          </button>
          <button className="done-btn" onClick={onClose}>
            ✓ Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-user-form">
      <div className="form-header">
        <h2>Create New Customer Account</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label>First Name *</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John"
                required
                maxLength="50"
              />
              {nameValid && <span className="checkmark">✓</span>}
            </div>
          </div>

          <div className="input-group">
            <label>Surname *</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Doe"
                required
                maxLength="50"
              />
              {surnameValid && <span className="checkmark">✓</span>}
            </div>
          </div>
        </div>

        <div className="input-group">
          <label>ID Number *</label>
          <div className="input-wrapper">
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="9001015800086"
              required
              maxLength="13"
            />
            {idValid && <span className="checkmark">✓</span>}
          </div>
          <small>13-digit South African ID number</small>
        </div>

        <div className="input-group">
          <label>Email Address *</label>
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="customer@example.com"
              required
              maxLength="100"
            />
            {emailValid && <span className="checkmark">✓</span>}
          </div>
        </div>

        <div className="input-group">
          <label>Temporary Password *</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Generate or enter password"
              required
              maxLength="128"
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {passwordValid && <span className="checkmark">✓</span>}
          </div>
          <button type="button" className="generate-btn" onClick={generatePassword}>
            🔐 Generate Secure Password
          </button>
          <small>Min 8 chars: uppercase, lowercase, number, special char (@$!%*?&#)</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || !nameValid || !surnameValid || !idValid || !emailValid || !passwordValid}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserAccount;
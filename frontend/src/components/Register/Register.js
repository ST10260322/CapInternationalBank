import React, { useState } from "react";  // REMOVE useEffect
import { useNavigate } from "react-router-dom";
import "./Register.css";
import api from "../../api";
import { calculatePasswordStrength } from "../../utils/passwordStrength";
// REMOVE: import { initializeCsrfToken } from "../../csrf";

function Register() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [message, setMessage] = useState("");
  
  // Validation states
  const [nameValid, setNameValid] = useState(false);
  const [surnameValid, setSurnameValid] = useState(false);
  const [idValid, setIdValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [countryValid, setCountryValid] = useState(false);
  
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
    setPasswordValid(newPassword.length >= 8);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const res = await api.post("/register", {
        name,
        surname,
        idNumber,
        email,
        password
      });
      
      setMessage(res.data.message);

      if (res.data.message === "User registered!") {
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="bank-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 5L5 20H55L30 5Z" fill="white"/>
            <rect x="10" y="25" width="8" height="25" fill="white"/>
            <rect x="22" y="25" width="8" height="25" fill="white"/>
            <rect x="34" y="25" width="8" height="25" fill="white"/>
            <rect x="46" y="25" width="8" height="25" fill="white"/>
            <rect x="5" y="50" width="50" height="5" fill="white"/>
          </svg>
        </div>
        
        <p className="register-subtitle">Join the world's leading bank</p>
        <h1 className="register-title">CAP International Bank</h1>
        
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="e.g. John"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameValid(e.target.value.length > 0 && /^[A-Za-z\s]+$/.test(e.target.value));
                  }}
                  required
                  className="form-input"
                  maxLength="50"
                />
                {nameValid && <span className="checkmark">✓</span>}
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Surname</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="e.g. Doe"
                  value={surname}
                  onChange={(e) => {
                    setSurname(e.target.value);
                    setSurnameValid(e.target.value.length > 0 && /^[A-Za-z\s]+$/.test(e.target.value));
                  }}
                  required
                  className="form-input"
                  maxLength="50"
                />
                {surnameValid && <span className="checkmark">✓</span>}
              </div>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">ID Number</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="0402030165086"
                value={idNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setIdNumber(value);
                  setIdValid(value.length === 13);
                }}
                required
                className="form-input"
                maxLength="13"
              />
              {idValid && <span className="checkmark">✓</span>}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="capinternationalbank@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailValid(e.target.value.includes('@') && e.target.value.includes('.'));
                }}
                required
                className="form-input"
                maxLength="100"
              />
              {emailValid && <span className="checkmark">✓</span>}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper password-wrapper">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
                className="form-input password-input"
                maxLength="128"
              />
              {passwordValid && <span className="checkmark">✓</span>}
            </div>
            
            {passwordStrength && password && (
              <div className="password-strength">
                <div className="strength-bar-container">
                  <div 
                    className="strength-bar" 
                    style={{ 
                      width: `${passwordStrength.percentage}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <p className="strength-label" style={{ color: passwordStrength.color }}>
                  Password Strength: <strong>{passwordStrength.label}</strong>
                </p>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="strength-feedback">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">Country of Residence</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="South Africa"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCountryValid(e.target.value.length > 0);
                }}
                required
                className="form-input"
                style={{ width: "250px"}}
                maxLength="50"
              />
              {countryValid && <span className="checkmark">✓</span>}
            </div>
          </div>
          
          <button type="submit" className="register-button">Sign Up</button>
        </form>
        
        {message && (
          <p className={`message ${message.includes('Error') || message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
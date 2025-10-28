import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../../api";

function Login() {
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { accountNumber, password });
      
      // Store user details in localStorage
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userSurname', res.data.surname);
      localStorage.setItem('userId', res.data.userId);
      
      setMessage(res.data.message);

      if (res.data.userId) {
        navigate("/home", { state: { userId: res.data.userId } });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="login-container">
      {/* Employee Login Button - Top Right */}
      <Link to="/employee/login" className="employee-access-btn">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2L2 7V13C2 16.866 5.817 18.586 10 19C14.183 18.586 18 16.866 18 13V7L10 2Z"/>
        </svg>
        Employee Access
      </Link>

      <div className="login-card">
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
        
        <h1 className="welcome-title">
          <span className="welcome-to">Welcome to</span>
          <span className="bank-name">CAP International Bank</span>
        </h1>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Account Number</label>
            <input
              type="text"
              placeholder="Enter your account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <button type="submit" className="login-button">Log In</button>
        </form>
        
        <p className="signup-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
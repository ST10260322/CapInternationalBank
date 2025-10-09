import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./EmployeeLogin.css";
import api from "../../api";

function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/employee/login", { email, password });
      
      setMessage(res.data.message);

      if (res.data.userId && res.data.isEmployee) {
        // Navigate to employee dashboard
        navigate("/employee/dashboard", { 
          state: { 
            userId: res.data.userId,
            employeeId: res.data.employeeId,
            name: res.data.name,
            department: res.data.department
          } 
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error logging in";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-container">
      {/* Back to Customer Login Button */}
      <Link to="/" className="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
        </svg>
        Back to Customer Login
      </Link>

      <div className="employee-login-card">
        {/* Employee Badge Header */}
        <div className="employee-header">
          <div className="employee-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M30 10L10 22V38C10 45.732 18.268 49.172 30 50C41.732 49.172 50 45.732 50 38V22L30 10Z" fill="white"/>
              <circle cx="30" cy="28" r="8" fill="#1976D2"/>
              <path d="M20 45C20 40 24 38 30 38C36 38 40 40 40 45" stroke="#1976D2" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h1 className="employee-title">Employee Portal</h1>
          <p className="employee-subtitle">CAP International Bank</p>
        </div>
        
        <form onSubmit={handleLogin} className="employee-login-form">
          <div className="input-group">
            <label className="input-label">Employee Email</label>
            <input
              type="email"
              placeholder="employee@capbank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          
          <button 
            type="submit" 
            className="employee-login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Access Employee Dashboard"}
          </button>
        </form>
        
        {message && (
          <p className={`message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </p>
        )}

        <div className="employee-footer">
          <p>Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLogin;
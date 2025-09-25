import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // We'll create this CSS file
import api from "../../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      setMessage(res.data.message + " (User ID: " + res.data.userId + ")");

      // Navigate to Home page with userId in state
      if (res.data.userId) {
        navigate("/home", { state: { userId: res.data.userId } });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="welcome-title">Welcome to CAP International Bank</h1>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <button type="submit" className="login-button">Login</button>
        </form>
        
        <p className="signup-link">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import api from "../../api";
import { calculatePasswordStrength } from "../../utils/passwordStrength";

function Register() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
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
        navigate("/"); // go back to login page
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Your Account</h1>
        <h2 className="register-subtitle">CAP International Bank</h2>
        
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>
          
          <div className="input-group">
            <input
              type="text"
              placeholder="ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
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
              onChange={handlePasswordChange}
              required
              className="form-input"
            />
            
            {/* Password Strength Meter */}
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
          
          <button type="submit" className="register-button">Register</button>
        </form>
        
        <p className="login-link">
          Already have an account? <Link to="/">Login here</Link>
        </p>
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
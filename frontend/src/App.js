import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import PaymentFlow from "./components/PaymentFlow/PaymentFlow";
import EmployeeLogin from "./components/EmployeeLogin/EmployeeLogin";
import EmployeeDashboard from "./components/EmployeeDashboard/EmployeeDashboard";
import { initializeCsrfToken } from "./csrf";
import './App.css'; 

function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeCsrfToken();
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/payment" element={<PaymentFlow />} />
        
        {/* Employee Routes */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
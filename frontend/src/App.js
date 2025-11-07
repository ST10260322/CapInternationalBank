import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import PaymentFlow from "./components/PaymentFlow/PaymentFlow";
import EmployeeLogin from "./components/EmployeeLogin/EmployeeLogin";
import EmployeeDashboard from "./components/EmployeeDashboard/EmployeeDashboard";
import { initializeCsrfToken } from "./csrf";
import { Toaster } from 'react-hot-toast';
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
      {/* Toaster component for notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(139, 34, 34, 0.3)',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '14px',
          },
          // Success style
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
            style: {
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              border: '1px solid #22c55e',
            },
          },
          // Error style
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              border: '1px solid #ef4444',
            },
          },
          // Loading style
          loading: {
            style: {
              background: 'linear-gradient(135deg, #8B2222, #6B1A1A)',
              color: '#fff',
              border: '1px solid #8B2222',
            },
          },
        }}
      />
      
      {/* Routes */}
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
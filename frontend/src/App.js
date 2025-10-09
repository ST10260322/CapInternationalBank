import React, { useEffect, useRef } from "react";  // Add useRef
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import PaymentFlow from "./components/PaymentFlow/PaymentFlow";
import { initializeCsrfToken } from "./csrf";
import './App.css'; 

function App() {
  const initialized = useRef(false);  // Track if already initialized

  useEffect(() => {
    // Only initialize once, even in StrictMode
    if (!initialized.current) {
      initialized.current = true;
      initializeCsrfToken();
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/payment" element={<PaymentFlow />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ConfirmPayment({ prevStep, data, userId }) { // receive userId from parent
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await axios.post("https://localhost:3001/payments", {
        userId,
        recipientName: data.recipientName,
        bank: data.bank,
        accountNumber: data.accountNumber,
        recipientEmail: data.email,
        currency: data.currency,
        amount: data.amount,
        reference: data.reference,
        swiftCode: data.swiftCode
      });
      alert("Payment confirmed and saved!");
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Error saving payment");
    }
  };

  return (
    <div>
      <h2>Confirm Payment</h2>
      <p><b>Name:</b> {data.recipientName}</p>
      <p><b>Bank:</b> {data.bank}</p>
      <p><b>Account Number:</b> {data.accountNumber}</p>
      <p><b>Email:</b> {data.email}</p>
      <p><b>Currency:</b> {data.currency}</p>
      <p><b>Amount:</b> {data.amount}</p>
      <p><b>Reference:</b> {data.reference}</p>
      <p><b>SWIFT Code:</b> {data.swiftCode}</p>
      <button onClick={prevStep}>Back</button>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
}

export default ConfirmPayment;

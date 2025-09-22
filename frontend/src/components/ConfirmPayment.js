import React from "react";
import { useNavigate } from "react-router-dom"; // <- import

function ConfirmPayment({ prevStep, data }) {
  const navigate = useNavigate(); // <- get navigate function

  const handleConfirm = () => {
    alert("Payment confirmed!");
    // Navigate back to home after confirmation
    navigate("/home");
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

import React from "react";
import { useNavigate } from "react-router-dom"; // import navigate

function QuickActionsCard() {
  const navigate = useNavigate(); // get navigate function

  const handleMakePayment = () => {
    navigate("/payment"); // go to payment flow page
  };

  return (
    <div style={{ border: "1px solid gray", padding: "20px", width: "300px" }}>
      <h2>Quick Actions</h2>
      <button 
        style={{ display: "block", margin: "10px 0" }} 
        onClick={handleMakePayment} // navigate when clicked
      >
        Make International Payment
      </button>
      <button style={{ display: "block", margin: "10px 0" }}>
        View Payment History
      </button>
    </div>
  );
}

export default QuickActionsCard;

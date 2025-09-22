import React from "react";
import { useNavigate } from "react-router-dom";

function QuickActionsCard({ userId }) { // accept userId as prop
  const navigate = useNavigate();

  const handleMakePayment = () => {
    navigate("/payment", { state: { userId } }); // pass userId to PaymentFlow
  };

  return (
    <div style={{ border: "1px solid gray", padding: "20px", width: "300px" }}>
      <h2>Quick Actions</h2>
      <button onClick={handleMakePayment} style={{ display: "block", margin: "10px 0" }}>
        Make International Payment
      </button>
      <button style={{ display: "block", margin: "10px 0" }}>
        View Payment History
      </button>
    </div>
  );
}

export default QuickActionsCard;

// AccountCard.js
import React from "react";

function AccountCard() {
  return (
    <div style={{ border: "1px solid gray", padding: "20px", width: "300px" }}>
      <h2>Account Overview</h2>
      <p>Balance: $10,000</p>
      <p>Recent Transactions:</p>
      <ul>
        <li>Payment to John - $100</li>
        <li>Received from Mary - $500</li>
      </ul>
    </div>
  );
}

export default AccountCard;

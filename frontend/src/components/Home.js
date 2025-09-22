import React from "react";
import { useNavigate } from "react-router-dom";
import AccountCard from "./AccountCard";
import QuickActionsCard from "./QuickActionsCard";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to CAP International Bank</h1>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <AccountCard />
        <QuickActionsCard navigate={navigate} /> {/* pass navigate as prop */}
      </div>
    </div>
  );
}

export default Home;

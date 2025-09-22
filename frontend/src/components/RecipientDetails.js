import React, { useState } from "react";

function RecipientDetails({ nextStep, updateData, data }) {
  const [form, setForm] = useState({
    recipientName: data.recipientName,
    bank: data.bank,
    accountNumber: data.accountNumber,
    email: data.email
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    updateData(form);
    nextStep();
  };

  return (
    <div>
      <h2>Recipient Details</h2>
      <form onSubmit={handleNext}>
        <input name="recipientName" placeholder="Name" value={form.recipientName} onChange={handleChange} required /><br/>
        <input name="bank" placeholder="Bank" value={form.bank} onChange={handleChange} required /><br/>
        <input name="accountNumber" placeholder="Account Number" value={form.accountNumber} onChange={handleChange} required /><br/>
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required /><br/>
        <button type="submit">Next</button>
      </form>
    </div>
  );
}

export default RecipientDetails;

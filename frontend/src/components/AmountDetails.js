import React, { useState } from "react";

function AmountDetails({ nextStep, prevStep, updateData, data }) {
  const [form, setForm] = useState({
    currency: data.currency,
    amount: data.amount,
    reference: data.reference,
    swiftCode: data.swiftCode
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
      <h2>Amount & Details</h2>
      <form onSubmit={handleNext}>
        <input name="currency" placeholder="Currency" value={form.currency} onChange={handleChange} required /><br/>
        <input name="amount" placeholder="Amount" type="number" value={form.amount} onChange={handleChange} required /><br/>
        <input name="reference" placeholder="Reference" value={form.reference} onChange={handleChange} /><br/>
        <input name="swiftCode" placeholder="SWIFT Code" value={form.swiftCode} onChange={handleChange} /><br/>
        <button type="button" onClick={prevStep}>Back</button>
        <button type="submit">Next</button>
      </form>
    </div>
  );
}

export default AmountDetails;

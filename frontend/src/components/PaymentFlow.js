import React, { useState } from "react";
import RecipientDetails from "./RecipientDetails";
import AmountDetails from "./AmountDetails";
import ConfirmPayment from "./ConfirmPayment";

function PaymentFlow() {
  const [step, setStep] = useState(1);
  const [paymentData, setPaymentData] = useState({
    recipientName: "",
    bank: "",
    accountNumber: "",
    email: "",
    currency: "",
    amount: "",
    reference: "",
    swiftCode: ""
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const updateData = (newData) => {
    setPaymentData({ ...paymentData, ...newData });
  };

  switch(step) {
    case 1:
      return <RecipientDetails nextStep={nextStep} updateData={updateData} data={paymentData} />;
    case 2:
      return <AmountDetails nextStep={nextStep} prevStep={prevStep} updateData={updateData} data={paymentData} />;
    case 3:
      return <ConfirmPayment prevStep={prevStep} data={paymentData} />;
    default:
      return null;
  }
}

export default PaymentFlow;

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import RecipientDetails from "./RecipientDetails";
import AmountDetails from "./AmountDetails";
import ConfirmPayment from "./ConfirmPayment";
import api from "../../api";


function PaymentFlow() {
  const location = useLocation();
  const { userId } = location.state || {}; 
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
      return <ConfirmPayment prevStep={prevStep} data={paymentData} userId={userId} />;
    default:
      return null;
  }
}

export default PaymentFlow;

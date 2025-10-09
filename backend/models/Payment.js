import mongoose from "../database.js";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipientName: { type: String, required: true },
  bank: { type: String, required: true },
  accountNumber: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String },
  swiftCode: { type: String },
  
  // NEW FIELDS FOR EMPLOYEE APPROVAL SYSTEM
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  reviewedAt: { type: Date },
  reviewComment: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
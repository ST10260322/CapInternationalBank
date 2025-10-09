import mongoose from "../database.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  idNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Employee role fields
  isEmployee: { type: Boolean, default: false },
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

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
  
  // Account lockout fields
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

// Virtual property to check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts after successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

export default mongoose.model("User", userSchema);

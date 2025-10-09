// createEmployee.js
// Helper script to create employee accounts
// SAVE THIS FILE IN YOUR backend/ FOLDER
// Run with: node createEmployee.js

import mongoose from "./database.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

async function createEmployee() {
  try {
    console.log("🔧 Creating employee account...\n");

    // Employee details - CUSTOMIZE THESE
    const employeeData = {
      name: "Lionel",
      surname: "Messi",
      idNumber: "9999999999999",
      email: "messi@gmail.com",
      password: "@Messi123!",  
      isEmployee: true,
      employeeId: "EMP002",
      department: "Operations"
    };

    // Check if employee already exists
    const existingEmployee = await User.findOne({ email: employeeData.email });
    if (existingEmployee) {
      console.log("❌ Employee with this email already exists!");
      console.log(`Email: ${employeeData.email}`);
      process.exit(1);
    }

    // Hash the password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // Create employee
    console.log("💾 Saving to database...");
    const newEmployee = await User.create({
      name: employeeData.name,
      surname: employeeData.surname,
      idNumber: employeeData.idNumber,
      email: employeeData.email,
      password: hashedPassword,
      isEmployee: true,
      employeeId: employeeData.employeeId,
      department: employeeData.department
    });

    console.log("\n✅ Employee account created successfully!");
    console.log("\n📋 Employee Details:");
    console.log("─".repeat(50));
    console.log(`Name:         ${newEmployee.name} ${newEmployee.surname}`);
    console.log(`Email:        ${newEmployee.email}`);
    console.log(`Password:     ${employeeData.password}`);
    console.log(`Employee ID:  ${newEmployee.employeeId}`);
    console.log(`Department:   ${newEmployee.department}`);
    console.log(`Database ID:  ${newEmployee._id}`);
    console.log("─".repeat(50));
    console.log("\n🎉 You can now login at: https://localhost:3000/employee/login");
    console.log("   Use these credentials to access the Employee Portal.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating employee:", error.message);
    process.exit(1);
  }
}

// Run the function
createEmployee();
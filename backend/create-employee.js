import mongoose from './database.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';

/**
 * Script to create an employee account for CAP International Bank
 * Run this after setting up the database to create the first employee
 * 
 * Usage: node create-employee.js
 */

async function createEmployee() {
  try {
    console.log('🔧 Starting employee account creation...\n');
    
    // Employee credentials
    const employeeData = {
      email: 'employee@capbank.com',
      password: 'Employee@123',
      name: 'Test',
      surname: 'Employee',
      employeeId: 'EMP001',
      department: 'Administration',
      idNumber: '9001015800086'
    };
    
    console.log('📧 Checking if employee already exists...');
    
    // Check if employee already exists
    const existingEmployee = await User.findOne({ email: employeeData.email });
    
    if (existingEmployee) {
      console.log('⚠️  Employee account already exists!\n');
      console.log('📧 Employee Login Credentials:');
      console.log('   Email:', employeeData.email);
      console.log('   Password:', employeeData.password);
      console.log('   Employee ID:', existingEmployee.employeeId);
      console.log('   Department:', existingEmployee.department);
      console.log('\n🌐 Login URL: http://localhost:3000/employee/login\n');
      
      // Ask if they want to reset password
      console.log('💡 To reset the password, delete this user from MongoDB and run this script again.\n');
      process.exit(0);
    }
    
    console.log('✅ No existing employee found. Creating new employee account...\n');
    
    // Hash password with bcrypt (10 rounds)
    console.log('🔐 Hashing password with bcrypt (10 rounds)...');
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    console.log('✅ Password hashed successfully\n');
    
    // Create employee account
    console.log('💾 Saving employee to database...');
    const employee = await User.create({
      name: employeeData.name,
      surname: employeeData.surname,
      email: employeeData.email,
      password: hashedPassword,
      isEmployee: true,
      employeeId: employeeData.employeeId,
      department: employeeData.department,
      idNumber: employeeData.idNumber,
      accountNumber: 'EMP' + Date.now() // Generate unique account number
    });
    
    console.log('✅ Employee account created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 EMPLOYEE LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Email:        ', employeeData.email);
    console.log('   Password:     ', employeeData.password);
    console.log('   Employee ID:  ', employee.employeeId);
    console.log('   Department:   ', employee.department);
    console.log('   User ID:      ', employee._id);
    console.log('   Account #:    ', employee.accountNumber);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🌐 Login URL: http://localhost:3000/employee/login');
    console.log('\n📝 IMPORTANT: Save these credentials! You will need them to login.\n');
    console.log('🔒 SECURITY NOTE: Change the password after first login in production.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR creating employee account:');
    console.error('   Error:', err.message);
    
    if (err.message.includes('connect')) {
      console.error('\n💡 TROUBLESHOOTING:');
      console.error('   1. Check that MongoDB is running');
      console.error('   2. Verify MONGODB_URI in .env file');
      console.error('   3. Check network connection');
      console.error('   4. Verify IP whitelist in MongoDB Atlas\n');
    }
    
    if (err.code === 11000) {
      console.error('\n💡 SOLUTION: Email already exists in database.');
      console.error('   Delete the existing user or use a different email.\n');
    }
    
    process.exit(1);
  }
}

// Run the function
console.log('\n🏦 CAP International Bank - Employee Account Setup');
console.log('═══════════════════════════════════════════════════════\n');

createEmployee();
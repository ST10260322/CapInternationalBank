# 🎓 Installation Guide for Lecturers/Markers

**Welcome! This guide will help you run the CAP International Bank secure portal on your machine.**

**⏱️ Estimated Setup Time:** 15-20 minutes

---

## 📋 Quick Start Checklist

Before you begin, ensure you have:

- [ ] Node.js v18+ installed
- [ ] npm v8+ installed
- [ ] Git installed
- [ ] mkcert installed
- [ ] MongoDB Atlas account (free tier)
- [ ] 15-20 minutes of setup time

---

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository (2 minutes)

```bash
# Clone the repository
git clone https://github.com/ST10260322/CapInternationalBank.git

# Navigate to project directory
cd CapInternationalBank
```

**✅ Verify:** You should see `backend/` and `frontend/` folders

---

### Step 2: Install Backend Dependencies (3 minutes)

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install
```

**Expected output:**
```
added 150 packages in 30s
```

**✅ Verify:** Check that `node_modules/` folder was created

---

### Step 3: Install Frontend Dependencies (3 minutes)

```bash
# Navigate to frontend folder (from project root)
cd ../frontend

# Install all dependencies
npm install
```

**Expected output:**
```
added 1500 packages in 45s
```

**✅ Verify:** Check that `node_modules/` folder was created

---

### Step 4: Setup MongoDB Atlas (5 minutes)

#### 4a. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google account

#### 4b. Create a Cluster

1. Choose "FREE" tier (M0)
2. Select any cloud provider and region (closest to you)
3. Click "Create Cluster"
4. Wait 3-5 minutes for cluster to be created

#### 4c. Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username: `capbankadmin`
5. Set password: `SecurePass123!` (or your own secure password)
6. Set role: "Read and write to any database"
7. Click "Add User"

#### 4d. Whitelist Your IP Address

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development only)
4. Click "Confirm"

#### 4e. Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://capbankadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>` with your actual password**
6. **Add `/capbank` after `.net`** to specify database name:
   ```
   mongodb+srv://capbankadmin:SecurePass123!@cluster0.xxxxx.mongodb.net/capbank?retryWrites=true&w=majority
   ```

**✅ Keep this connection string - you'll need it in Step 6!**

---

### Step 5: Generate SSL Certificates (2 minutes)

#### 5a. Install mkcert

**macOS:**
```bash
brew install mkcert
```

**Windows (Chocolatey):**
```bash
choco install mkcert
```

**Windows (Manual):**
1. Download from https://github.com/FiloSottile/mkcert/releases
2. Add to PATH

**Linux:**
```bash
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

#### 5b. Generate Certificates

```bash
# Navigate to backend folder
cd backend

# Install mkcert CA (one-time setup)
mkcert -install

# Generate certificates for localhost
mkcert localhost 127.0.0.1 ::1
```

**Expected output:**
```
Created a new certificate valid for the following names 📜
 - "localhost"
 - "127.0.0.1"
 - "::1"

The certificate is at "./localhost+2.pem" and the key at "./localhost+2-key.pem" ✅
```

**✅ Verify:** Check that two files were created:
```bash
ls -la *.pem
# Should show:
# localhost+2.pem
# localhost+2-key.pem
```

---

### Step 6: Configure Environment Variables (3 minutes)

```bash
# Navigate to backend folder (if not already there)
cd backend

# Copy the example file
cp .env.example .env

# Edit the .env file
# On macOS/Linux:
nano .env

# On Windows:
notepad .env
```

**Update these values in `.env`:**

```env
# Paste your MongoDB connection string from Step 4
MONGODB_URI=mongodb+srv://capbankadmin:SecurePass123!@cluster0.xxxxx.mongodb.net/capbank?retryWrites=true&w=majority

# Generate a secure session secret (run this command and paste the output):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=paste-the-generated-secret-here

# Leave these as default:
PORT=3001
NODE_ENV=development
SSL_KEY_PATH=./localhost+2-key.pem
SSL_CERT_PATH=./localhost+2.pem
```

**✅ Save and close the file**

---

### Step 7: Create Employee Account (1 minute)

```bash
# Navigate to backend folder (if not already there)
cd backend

# Run the employee creation script
node create-employee.js
```

**Expected output:**
```
🏦 CAP International Bank - Employee Account Setup
═══════════════════════════════════════════════════════

🔧 Starting employee account creation...

📧 Checking if employee already exists...
✅ No existing employee found. Creating new employee account...

🔐 Hashing password with bcrypt (10 rounds)...
✅ Password hashed successfully

💾 Saving employee to database...
✅ Employee account created successfully!

═══════════════════════════════════════════════════════
📧 EMPLOYEE LOGIN CREDENTIALS
═══════════════════════════════════════════════════════
   Email:         employee@capbank.com
   Password:      Employee@123
   Employee ID:   EMP001
   Department:    Administration
   User ID:       507f1f77bcf86cd799439011
   Account #:     EMP1730984567890
═══════════════════════════════════════════════════════

🌐 Login URL: http://localhost:3000/employee/login
```

**✅ IMPORTANT: Save these credentials! You'll need them to login.**

---

### Step 8: Start the Application (1 minute)

You need **TWO terminal windows/tabs**:

#### Terminal 1 - Backend Server

```bash
cd backend
npm start
```

**Expected output:**
```
✅ SSL/TLS Configuration:
   - Certificate loaded successfully
   - TLS Version: 1.2 - 1.3
   - Perfect Forward Secrecy: Enabled
   - HSTS: Enabled (max-age: 1 year)
   - Cipher Suite: Modern, Secure Ciphers Only

✅ Connected to MongoDB Atlas
Secure server running on https://localhost:3001
```

**✅ Leave this terminal running!**

#### Terminal 2 - Frontend Server

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.X:3000
```

**✅ Browser should automatically open to http://localhost:3000**

---

### Step 9: Accept SSL Certificate Warning (30 seconds)

On first visit, your browser will show a security warning:

**Chrome/Edge:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

**Firefox:**
1. Click "Advanced"
2. Click "Accept the Risk and Continue"

**Safari:**
1. Click "Show Details"
2. Click "visit this website"

**✅ This is normal for self-signed certificates in development!**

---

## 🎉 Success! You're Ready to Test

### Access Points:

**Customer Portal:**
- URL: http://localhost:3000
- Note: Cannot self-register (see testing guide below)

**Employee Portal:**
- URL: http://localhost:3000/employee/login
- Email: `employee@capbank.com`
- Password: `Employee@123`

---

## 🧪 Testing the Application

### Test 1: Employee Login ✅

1. Navigate to http://localhost:3000/employee/login
2. Enter:
   - Email: `employee@capbank.com`
   - Password: `Employee@123`
3. Click "Access Employee Dashboard"
4. **✅ You should see the Employee Dashboard**

### Test 2: Create a Customer Account ✅

1. From Employee Dashboard, click "User Management"
2. Click "Create New User"
3. Fill in the form:
   - Name: `John`
   - Surname: `Doe`
   - ID Number: `1234567890123` (13 digits)
   - Email: `john.doe@test.com`
4. Click "🔐 Generate Secure Password"
5. **✅ Password should appear and show green checkmark**
6. Click "Create Account"
7. **✅ You should see success message with credentials**
8. **Copy the Account Number and Password** (you'll need these)

### Test 3: Customer Login ✅

1. Navigate to http://localhost:3000
2. Enter:
   - Account Number: (from Step 2)
   - Password: (from Step 2)
3. Click "Log In"
4. **✅ You should see the Customer Dashboard**

### Test 4: Create a Payment ✅

1. From Customer Dashboard, navigate to "Make Payment"
2. Fill in the form:
   - Recipient Name: `Jane Smith`
   - Bank: `Standard Bank`
   - Account Number: `123456789`
   - Email: `jane@example.com`
   - Currency: `USD`
   - Amount: `100.50`
   - SWIFT Code: `SBZAZAJJ`
   - Reference: `Test payment`
3. Click "Submit Payment"
4. **✅ You should see success message**

### Test 5: Approve a Payment ✅

1. Login as employee (if not already)
2. Navigate to "Transactions"
3. Find the pending payment
4. Click "Approve"
5. Click "Confirm Approval" in dialog
6. **✅ Transaction status should change to "Approved"**

---

## 🐛 Troubleshooting

### Problem: Cannot connect to MongoDB

**Solution:**
1. Check `.env` file has correct `MONGODB_URI`
2. Verify MongoDB Atlas is running
3. Check IP whitelist in MongoDB Atlas
4. Test connection:
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.log('❌ Error:', err.message))"
```

### Problem: Port already in use

**Solution:**

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problem: SSL certificate error

**Solution:**
```bash
cd backend
mkcert -uninstall
mkcert -install
rm localhost+2*.pem
mkcert localhost 127.0.0.1 ::1
npm start
```

### Problem: "Cannot find module" errors

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📧 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the main README.md for detailed documentation
3. Check browser console for errors (F12 → Console)
4. Check terminal output for error messages



## ✅ Verification Checklist

Before marking, verify:

- [ ] Both servers are running without errors
- [ ] Can login as employee
- [ ] Can create customer accounts
- [ ] Can login as customer
- [ ] Can create payments
- [ ] Can approve transactions as employee
- [ ] SSL/HTTPS is working (check lock icon in browser)
- [ ] Security headers are present (check DevTools → Network)
- [ ] MongoDB is receiving data (check MongoDB Atlas)




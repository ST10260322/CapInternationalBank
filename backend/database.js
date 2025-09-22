const sqlite3 = require("sqlite3").verbose();

// This will create a database file called customerportal.db
const db = new sqlite3.Database("./customerportal.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});


// Users table 
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  idNumber TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

// Payments table
db.run(`CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  recipientName TEXT NOT NULL,
  bank TEXT NOT NULL,
  accountNumber TEXT NOT NULL,
  recipientEmail TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount REAL NOT NULL,
  reference TEXT,
  swiftCode TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id)
)`);

module.exports = db;

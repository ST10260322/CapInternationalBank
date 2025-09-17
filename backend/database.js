const sqlite3 = require("sqlite3").verbose();

// This will create a database file called customerportal.db
const db = new sqlite3.Database("./customerportal.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)`);

module.exports = db;

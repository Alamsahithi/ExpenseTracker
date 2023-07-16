const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 3000;

// MySQL configuration
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "SriSahi@22",
  database: "expensetracker",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err);
    return;
  }
  console.log("Connected to the database");

  // Create the users table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating users table: ", err);
    } else {
      console.log("Users table created or already exists");
    }
  });
});

// Middleware
app.use(express.json());
app.use(cors());

// Signup route
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  const user = {
    email: email,
    password: password,
  };

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    email,
    (err, results) => {
      if (err) {
        console.error("Error checking email uniqueness: ", err);
        res.status(500).json({ error: "Failed to check email uniqueness" });
        return;
      }

      if (results.length > 0) {
        // Email already exists
        res.status(409).json({ error: "Email already exists" });
      } else {
        // Email is unique, store user details
        connection.query("INSERT INTO users SET ?", user, (err, results) => {
          if (err) {
            console.error("Error storing user details: ", err);
            res.status(500).json({ error: "Failed to store user details" });
            return;
          }
          res.status(200).json({ message: "User details stored successfully" });
        });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

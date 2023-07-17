const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

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
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
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
  const { name, email, phone, password } = req.body;

  // Generate a salt and hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password: ", err);
      res.status(500).json({ error: "Failed to hash password" });
      return;
    }

    const user = {
      name: name,
      email: email,
      phone: phone,
      password: hashedPassword,
    };

    connection.query(
      "SELECT * FROM users WHERE email = ?",
      email,
      (err, results) => {
        if (err) {
          console.error("Error checking email: ", err);
          res.status(500).json({ error: "Failed to check email" });
          return;
        }

        if (results.length === 0) {
          // Email does not exist
          connection.query("INSERT INTO users SET ?", user, (err, results) => {
            if (err) {
              console.error("Error storing user details: ", err);
              res.status(500).json({ error: "Failed to store user details" });
              return;
            }
            res
              .status(200)
              .json({ message: "User details stored successfully" });
          });
        } else {
          // Email already exists
          res.status(409).json({ error: "Email already exists" });
        }
      }
    );
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    email,
    (err, results) => {
      if (err) {
        console.error("Error checking email: ", err);
        res.status(500).json({ error: "Failed to check email" });
        return;
      }

      if (results.length === 0) {
        // Email does not exist
        res.status(404).json({ error: "User does not exist" });
      } else {
        const user = results[0];

        // Compare the login password with the stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error("Error comparing passwords: ", err);
            res.status(500).json({ error: "Failed to compare passwords" });
            return;
          }

          if (isMatch) {
            // Password matches
            res.status(200).json({ message: "User logged in successfully" });
          } else {
            // Password does not match
            res.status(401).json({ error: "Email and password do not match" });
          }
        });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

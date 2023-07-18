const express = require("express");
const mysql = require("mysql2");
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
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

  connection.query(createUserTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating users table: ", err);
    } else {
      console.log("Users table created or already exists");
    }
  });
});

const createExpensesTableQuery = `
  CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expenseamount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`;

connection.query(createExpensesTableQuery, (err, results) => {
  if (err) {
    console.error("Error creating expenses table: ", err);
  } else {
    console.log("Expenses table created or already exists");
  }
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
            const userDetails = {
              name: user.name,
              email: user.email,
              phone: user.phone,
              userId: user.id,
            };
            res.status(200).json({
              message: "User logged in successfully",
              userDetails: userDetails,
            });
          } else {
            // Password does not match
            res.status(401).json({ error: "Email and password do not match" });
          }
        });
      }
    }
  );
});

// Get expenses route
app.get("/expenses/get-expenses/:userId", (req, res) => {
  const userId = req.params.userId;

  connection.query(
    "SELECT * FROM expenses WHERE user_id = ?",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error retrieving expenses: ", err);
        res.status(500).json({ error: "Failed to retrieve expenses" });
        return;
      }

      res.status(200).json(results);
    }
  );
});

//add expense
app.post("/expenses/addexpense/:userId", (req, res) => {
  const userId = req.params.userId;
  const { expenseamount, category, description } = req.body;

  const expense = {
    expenseamount: expenseamount,
    category: category,
    description: description,
    user_id: userId,
  };

  connection.query("INSERT INTO expenses SET ?", expense, (err, results) => {
    if (err) {
      console.error("Error storing expense details: ", err);
      res.status(500).json({ error: "Failed to store expense details" });
      return;
    }

    res.status(200).json({ message: "Expense details stored successfully" });
  });
});

// Delete expense route
app.delete("/expenses/delete-expense/:userId", (req, res) => {
  const userId = req.params.userId;
  const expenseId = req.query.expenseId;

  connection.query(
    "DELETE FROM expenses WHERE user_id = ? AND id = ?",
    [userId, expenseId],
    (err, results) => {
      if (err) {
        console.error("Error deleting expense: ", err);
        res.status(500).json({ error: "Failed to delete expense" });
        return;
      }

      res.status(200).json({ message: "Expense deleted successfully" });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

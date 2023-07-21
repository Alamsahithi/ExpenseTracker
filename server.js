const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3001;

// MySQL configuration
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Munnuru@1998",
  database: "expensetrackerapp",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err);
    return;
  }
  console.log("Connected to the database");

  // Create the users table if it doesn't exist
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

  connection.query(createUsersTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating users table: ", err);
    } else {
      console.log("Users table created or already exists");
    }
  });

  // Create the expenses table if it doesn't exist
  const createExpensesTableQuery = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      expenseamount FLOAT NOT NULL,
      category VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  connection.query(createExpensesTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating expenses table: ", err);
    } else {
      console.log("Expenses table created or already exists");
    }
  });
});

// Middleware
app.use(express.json());
app.use(cors());

// JWT secret key
const secretKey = "UYGR$#%^&*UIHGHGCDXRSW"; // Replace this with a strong and secure key in production

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
            // Create a JWT with user details
            const tokenPayload = {
              userId: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
            };
            const tokenOptions = {
              expiresIn: "1h", // JWT will expire in 1 hour, adjust as needed
            };
            const token = jwt.sign(tokenPayload, secretKey, tokenOptions);

            // Send the JWT and user details in the response
            res.status(200).json({ token, userDetails: tokenPayload });
          } else {
            // Password does not match
            res.status(401).json({ error: "Email and password do not match" });
          }
        });
      }
    }
  );
});

// Function to authenticate token from headers
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = user;
    next();
  });
}

// Delete expense route
app.delete("/expenses/delete-expense", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const expenseId = req.query.expenseId;

  connection.query(
    "DELETE FROM expenses WHERE id = ? AND user_id = ?",
    [expenseId, userId],
    (err, results) => {
      if (err) {
        console.error("Error deleting expense: ", err);
        res.status(500).json({ error: "Failed to delete expense" });
        return;
      }

      if (results.affectedRows === 0) {
        // Expense not found or doesn't belong to the user
        res.status(404).json({ error: "Expense not found" });
      } else {
        res.status(200).json({ message: "Expense deleted successfully" });
      }
    }
  );
});

// Get expenses route
app.get("/expenses/get-expenses", authenticateToken, (req, res) => {
  const userId = req.user.userId;

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

// Add expense route
app.post("/expenses/addexpense", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { expenseamount, category, description } = req.body;

  const expense = {
    expenseamount: parseFloat(expenseamount),
    category,
    description,
    user_id: userId,
  };

  connection.query("INSERT INTO expenses SET ?", expense, (err, results) => {
    if (err) {
      console.error("Error storing expense details: ", err);
      res.status(500).json({ error: "Failed to store expense details" });
      return;
    }

    res.status(200).json({ message: "Expense saved successfully" });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

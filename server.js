const express = require("express");
// const fs = require("fs");
// const path = require("path");
require("dotenv").config();
const cors = require("cors");
const sequelize = require("./configs/databaseConfig");
const port = process.env.PORT;
// const User = require("./models/userModel");
// const Expense = require("./models/expenseModel");
// const Payment = require("./models/paymentModel");
// const ForgotPasswordRequests = require("./models/forgotPasswordRequestsModel");
// const helmet = require("helmet");

const app = express();

app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(helmet());
// app.use(express.static("public"));

// User.hasMany(Expense);
// Expense.belongsTo(User);

// User.hasMany(Payment);
// Payment.belongsTo(User);

// ForgotPasswordRequests.belongsTo(User, { foreignKey: "userId" });

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' https://checkout.razorpay.com 'unsafe-inline' 'unsafe-eval'"
//   );
//   next();
// });
// app.use("/public", express.static(path.join(__dirname, "public")));
// app.get("/login", async (req, res) => {
//   try {
//     const signinForm = fs.readFileSync(
//       path.join(__dirname, "public", "views", "signin.html"),
//       "utf8"
//     );
//     return res.send(signinForm);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// });
// app.get("/signup", async (req, res) => {
//   try {
//     const signupForm = fs.readFileSync(
//       path.join(__dirname, "public", "views", "signup.html"),
//       "utf8"
//     );
//     return res.send(signupForm);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// });
// app.get("/expenses", async (req, res) => {
//   try {
//     const expensesHtml = fs.readFileSync(
//       path.join(__dirname, "public", "views", "expenses.html"),
//       "utf8"
//     );
//     return res.send(expensesHtml);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// });
// app.use("/user", require("./routes/userRoutes"));
// app.use("/expense", require("./routes/expenseRoutes"));
// app.use("/payment", require("./routes/paymentRoutes"));
// app.use("/premium", require("./routes/premiumRoutes"));

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    return app.listen(port);
  })
  .then(() => {
    console.log(`Server started on ${port}`);
  })
  .catch((error) => console.log(error));

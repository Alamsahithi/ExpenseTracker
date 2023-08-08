const express = require("express");
require("dotenv").config();
const cors = require("cors");
const sequelize = require("./configs/databaseConfig");
const port = process.env.PORT || 8080;
const User = require("./models/userModel");
const Expense = require("./models/expenseModel");
const Payment = require("./models/paymentModel");
const ForgotPasswordRequests = require("./models/forgotPasswordRequestsModel");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Payment);
Payment.belongsTo(User);

ForgotPasswordRequests.belongsTo(User, { foreignKey: "userId" });

sequelize
  .sync()
  .then(() => console.log("Database connected"))
  .catch((error) => console.log(error));

app.use("/user", require("./routes/userRoutes"));
app.use("/expense", require("./routes/expenseRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));
app.use("/premium", require("./routes/premiumRoutes"));

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});

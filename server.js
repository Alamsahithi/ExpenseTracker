const express = require("express");
const cors = require("cors");
const sequelize = require("./configs/databaseConfig");
const User = require("./models/userModel");
const Expense = require("./models/expenseModel");
const Payment = require("./models/paymentModel");
const ForgotPasswordRequest = require("./models/forgotPasswordRequestModel");
const Download = require("./models/downloadModel");
require("dotenv").config();
const helmet = require("helmet");

const app = express();

const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

app.use("/user", require("./routes/userRoutes"));
app.use("/expense", require("./routes/expenseRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));
app.use("/premium", require("./routes/premiumRoutes"));

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Payment);
Payment.belongsTo(User);
User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);
User.hasMany(Download);
Download.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    return app.listen(port);
  })
  .then(() => console.log(`Server running on port ${port}`))
  .catch((err) => console.log(err));

const { DataTypes } = require("sequelize");
const sequelize = require("../configurations/databaseConfig");

const Payment = sequelize.define("Payment", {
  razorpay_order_id: { type: DataTypes.STRING(200), allowNull: false },
  order_id: { type: DataTypes.STRING(200), allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING(200), allowNull: false },
  status: { type: DataTypes.STRING(200), allowNull: false },
});

module.exports = Payment;

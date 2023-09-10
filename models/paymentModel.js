const Sequelize = require("sequelize");
const sequelize = require("../configs/databaseConfig");

class Payment extends Sequelize.Model {}

Payment.init(
  {
    orderId: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    rpOrderId: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    amount: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
    currency: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    status: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: "payment" }
);

module.exports = Payment;

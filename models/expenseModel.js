const { DataTypes } = require("sequelize");
const sequelize = require("../configs/databaseConfig");

const Expense = sequelize.define("Expense", {
  amount: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.STRING(200), allowNull: false },
});

module.exports = Expense;

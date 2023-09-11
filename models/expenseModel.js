const { DataTypes } = require("sequelize");
const sequelize = require("../configurations/databaseConfig");

const Expense = sequelize.define("Expense", {
  amount: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.STRING(200), allowNull: false },
});

module.exports = Expense;

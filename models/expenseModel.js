const Sequelize = require("sequelize");
const sequelize = require("../configs/databaseConfig");

class Expense extends Sequelize.Model {}

Expense.init(
  {
    amount: { type: Sequelize.DataTypes.DOUBLE, allowNull: false },
    category: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    description: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: "expense" }
);

module.exports = Expense;

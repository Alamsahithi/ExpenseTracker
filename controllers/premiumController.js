const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const Sequelize = require("sequelize");

const getLeaderBorad = async (req, res) => {
  try {
    const user = await User.findByPk(req?.user?.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.premiumUser) {
      return res.status(400).json({ message: "You are not a premium user" });
    }
    const aggregatedExpenses = await User.findAll({
      attributes: [
        "id",
        "fullName",
        [
          Sequelize.fn("sum", Sequelize.col("Expenses.amount")),
          "totalExpenses",
        ],
      ],
      include: [{ model: Expense, attributes: [] }],
      group: ["User.id"],
      order: [[Sequelize.col("totalExpenses"), "DESC"]],
    });
    if (!aggregatedExpenses) {
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(200).json(aggregatedExpenses);
  } catch (error) {
    console.error("Error in getLeaderBorad:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getLeaderBorad };

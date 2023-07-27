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
    const leaderBoard = await User.findAll({
      attributes: [
        "fullName",
        [
          Sequelize.fn("COALESCE", Sequelize.col("totalExpenses"), 0),
          "totalExpenses",
        ],
      ],
      order: [["totalExpenses", "DESC"]],
    });
    if (!leaderBoard) {
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(200).json(leaderBoard);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { getLeaderBorad };

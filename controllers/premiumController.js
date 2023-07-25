const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

const getLeaderBorad = async (req, res) => {
  try {
    const user = await User.findByPk(req?.user?.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.premiumUser) {
      return res.status(400).json({ message: "You are not a premium user" });
    }
    const expenses = await Expense.findAll();
    if (!expenses) {
      return res.status(500).json({ message: "Internal server error" });
    }
    const leaderBoard = {};
    for (const expense of expenses) {
      const userId = expense?.UserId;
      if (!leaderBoard[userId]) {
        leaderBoard[userId] = expense?.amount;
      } else {
        leaderBoard[userId] += expense?.amount;
      }
    }
    const sortedLeaderBoard = Object.entries(leaderBoard).map(
      ([userId, totalExpenses]) => ({
        userId,
        totalExpenses,
      })
    );
    const users = await User.findAll();
    const userIdToUsernameMap = {};
    for (const user of users) {
      userIdToUsernameMap[user.id] = user.fullName;
    }
    for (const userTotalExpense of sortedLeaderBoard) {
      userTotalExpense.username = userIdToUsernameMap[userTotalExpense.userId];
    }
    sortedLeaderBoard.sort((a, b) => b.totalExpenses - a.totalExpenses);
    return res.status(200).json(sortedLeaderBoard);
  } catch (error) {
    console.error("Error in getLeaderBorad:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getLeaderBorad };

const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

const getAllExpenses = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      const expenses = await user.getExpenses();
      if (expenses) {
        return res.status(200).json(expenses);
      } else {
        return res.status(400).json({ message: "Something went wrong" });
      }
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const addExpense = async (req, res) => {
  const { amount, category, description } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      const expense = await user.createExpense({
        amount: parseFloat(amount),
        category,
        description,
      });
      if (expense) {
        return res.status(201).json({ message: "Expense saved successfully" });
      } else {
        return res
          .status(500)
          .json({ error: "Failed to store expense details" });
      }
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  const expenseId = req.query.expenseId;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        userId: user.id,
      },
    });
    if (!expense) {
      return res
        .status(400)
        .json({ message: "Expense not found or not associated with the user" });
    }
    await expense.destroy();
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { getAllExpenses, addExpense, deleteExpense };

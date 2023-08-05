const sequelize = require("../configs/databaseConfig");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const { Op } = require("sequelize");

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

const dailyExpenses = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.premiumUser) {
      return res.status(400).json({ message: "You are not a premium user" });
    }
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);
    const expenses = await Expense.findAll({
      where: {
        UserId: user.id,
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    return res.status(200).json(expenses);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const weeklyExpenses = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.premiumUser) {
      return res.status(400).json({ message: "You are not a premium user" });
    }
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    currentDate.setHours(23, 59, 59, 999);
    const expenses = await Expense.findAll({
      where: {
        UserId: user.id,
        createdAt: {
          [Op.between]: [sevenDaysAgo, currentDate],
        },
      },
    });
    return res.status(200).json(expenses);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const monthlyExpenses = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.premiumUser) {
      return res.status(400).json({ message: "You are not a premium user" });
    }
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    currentDate.setHours(23, 59, 59, 999);
    const expenses = await Expense.findAll({
      where: {
        UserId: user.id,
        createdAt: {
          [Op.between]: [thirtyDaysAgo, currentDate],
        },
      },
    });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addExpense = async (req, res) => {
  const { amount, category, description } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      await transaction.rollback();
      return res.status(400).json({ message: "User not found" });
    }
    const updatedTotalExpenses = user.totalExpenses + parseFloat(amount);
    await user.update({ totalExpenses: updatedTotalExpenses }, { transaction });
    const expense = await user.createExpense(
      {
        amount: parseFloat(amount),
        category,
        description,
      },
      { transaction }
    );

    if (!expense) {
      await transaction.rollback();
      return res.status(500).json({ error: "Failed to store expense details" });
    }
    await transaction.commit();
    return res.status(201).json({ message: "Expense saved successfully" });
  } catch (error) {
    await transaction.rollback();
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
    const updatedTotalExpenses =
      user.totalExpenses - parseFloat(expense?.amount);
    await user.update({ totalExpenses: updatedTotalExpenses });
    await expense.destroy();
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = {
  getAllExpenses,
  addExpense,
  deleteExpense,
  dailyExpenses,
  weeklyExpenses,
  monthlyExpenses,
};

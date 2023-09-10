const sequelize = require("../configs/databaseConfig");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

const getAllExpenses = async (req, res) => {
  const pageSize = parseInt(req.query.size) || 10;
  const currentPage = parseInt(req.query.page) || 1;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const totalRecords = await user.countExpenses();
    const totalPages = Math.ceil(totalRecords / pageSize);

    const expenses = await user.getExpenses({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
    });

    return res.status(200).json({
      current_page: totalPages === 0 ? 0 : currentPage,
      last_page: totalPages,
      data: expenses,
      total_records: totalRecords,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
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
};

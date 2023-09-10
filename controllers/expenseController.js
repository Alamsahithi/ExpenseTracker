const sequelize = require("../configs/databaseConfig");
const Expense = require("../models/expenseModel");

const getAllExpenses = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 5;
    const currentPage = parseInt(req.query.page) || 1;
    const totalRecords = await req.user.countExpenses();
    const totalPages = Math.ceil(totalRecords / pageSize);
    const expenses = await req.user.getExpenses({
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
    });
    if (!expenses) {
      return res.status(500).json({
        status: false,
        data: null,
        message:
          "Something went wring while fetching expenses, pleas try again",
      });
    }

    return res.status(200).json({
      status: true,
      data: {
        currentPage,
        lastPage: totalPages,
        data: expenses,
        totalRecords,
      },
      message: "List of all expenses",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const addExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, category, description } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const updatedTotalExpenses = await req.user.update(
      {
        totalExpenses: req.user.totalExpenses + parseFloat(amount),
      },
      { transaction }
    );
    if (!updatedTotalExpenses) {
      await transaction.rollback();
      throw new Error("Something wrong while adding expense, please try again");
    }
    const expense = await req.user.createExpense(
      {
        amount,
        category,
        description,
      },
      { transaction }
    );
    if (!expense) {
      await transaction.rollback();
      return res.status(500).json({
        status: false,
        data: null,
        message: "Something went wring while adding expense, pleas try again",
      });
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: expense,
      message: "Successfully added expense",
    });
  } catch (error) {
    transaction.rollback();
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const editExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.expenseId;
    if (!id) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing expense id",
      });
    }
    const user = req.user;
    const { amount, category, description } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const expense = await Expense.findOne(
      { where: { id, userId: user.id } },
      { transaction }
    );
    if (!expense) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Expense not found",
      });
    }
    const updatedTotalExpenses = await req.user.update({
      totalExpenses:
        req.user.totalExpenses - expense.amount + parseFloat(amount),
    });
    if (!updatedTotalExpenses) {
      await transaction.rollback();
      throw new Error("Something wrong while adding expense, please try again");
    }
    const updatedExpense = await expense.update({
      amount,
      category,
      description,
    });
    if (!updatedExpense) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Something went wring while editing expense, pleas try again",
      });
    }
    await transaction.commit();
    return res.status(201).json({
      status: true,
      data: updatedExpense,
      message: "Edited expense successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.expenseId;
    if (!id) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing expense id",
      });
    }
    const user = req.user;
    const expense = await Expense.findOne(
      { where: { id, userId: user.id } },
      { transaction }
    );
    if (!expense) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        data: null,
        message: "Expense not found",
      });
    }
    const updatedTotalExpenses = await req.user.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount,
      },
      { transaction }
    );
    if (!updatedTotalExpenses) {
      await transaction.rollback();
      throw new Error("Something wrong while adding expense, please try again");
    }
    const deletedExpense = await expense.destroy({ transaction });
    if (!deletedExpense) {
      await transaction.rollback();
      return res.status(500).json({
        status: false,
        data: null,
        message:
          "Something went wrong while deleting expense, please try again",
      });
    }
    await transaction.commit();
    return res.status(200).json({
      status: true,
      data: deletedExpense,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

module.exports = { getAllExpenses, addExpense, editExpense, deleteExpense };

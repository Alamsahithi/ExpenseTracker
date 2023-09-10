const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getAllExpenses,
  addExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const router = express.Router();

router.get("/all-expenses", protect, getAllExpenses);

router.post("/add-expense", protect, addExpense);
router.delete("/delete-expense", protect, deleteExpense);

module.exports = router;

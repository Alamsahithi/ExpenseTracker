const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createOrder,
  updateStatus,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/update-status", protect, updateStatus);

module.exports = router;

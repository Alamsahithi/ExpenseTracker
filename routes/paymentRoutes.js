const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createOrder,
  updateOrder,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/update-order", protect, updateOrder);

module.exports = router;

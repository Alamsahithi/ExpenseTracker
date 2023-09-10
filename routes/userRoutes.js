const express = require("express");
const {
  signup,
  signin,
  profile,
  forgotPassword,
  resetpassword,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", protect, profile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:requestId", resetpassword);

module.exports = router;

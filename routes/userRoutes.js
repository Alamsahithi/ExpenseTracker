const express = require("express");
const {
  userSignup,
  userSignin,
  getUserProfile,
  editUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signup", userSignup);

router.post("/signin", userSignin);

router.get("/profile", protect, getUserProfile);

router.post("/editProfile", protect, editUserProfile);

module.exports = router;

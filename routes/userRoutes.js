const express = require("express");
const {
  userSignup,
  userSignin,
  getUserProfile,
  editUserProfile,
  forgotpassword,
  resetpassword,
  updatepassword,
  download,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signup", userSignup);

router.post("/signin", userSignin);

router.get("/profile", protect, getUserProfile);

router.post("/editProfile", protect, editUserProfile);

router.post("/forgotpassword", forgotpassword);

router.get("/resetpassword/:requestId", resetpassword);

router.post("/updatepassword", updatepassword);

router.get("/download", protect, download);

module.exports = router;

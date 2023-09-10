const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { premium } = require("../middlewares/premiumMiddleware");
const { leaderboard, download } = require("../controllers/premiumController");

const router = express.Router();

router.get("/leaderboard", protect, premium, leaderboard);
router.get("/download", protect, premium, download);

module.exports = router;

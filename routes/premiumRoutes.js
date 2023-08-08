const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getLeaderBorad } = require("../controllers/premiumController");
const router = express.Router();

router.get("/leaderBoard", protect, getLeaderBorad);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getReferralSettings,
  updateReferralSettings,
} = require("../controllers/reffrellController");

const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/referral-settings", authMiddleware, getReferralSettings);
router.put("/referral-settings", authMiddleware, updateReferralSettings);

module.exports = router;

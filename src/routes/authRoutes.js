const express = require("express");
const router = express.Router();
const {
  login,
  register,
  registerStoreOwner,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post(
  "/register",
  upload.fields([{ name: "profile_picture", maxCount: 1 }]),
  register,
);

router.post("/register-store-owner", registerStoreOwner);

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, async (req, res) => {
  const { sendResponse } = require("../utils/response");
  const User = require("../models/User");
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, { user }, "User info fetched successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
});

module.exports = router;

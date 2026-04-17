

const express = require("express");
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  getPublicSettings,
} = require("../controllers/settingController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const { injectPublicStoreFilter } = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicSettings);

router.use(authMiddleware);
router.get("/", getUserSettings);
router.put("/", authorizeMinRole("store_owner"), updateUserSettings);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  getPublicSettings,
} = require("../controllers/systemsettingController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
// const { injectPublicStoreFilter } = require("../middlewares/ownershipFilter");

router.get("/public", getPublicSettings);

router.use(authMiddleware);
router.get("/", getUserSettings);
router.put("/", authorizeMinRole("store_owner"), updateUserSettings);

module.exports = router;

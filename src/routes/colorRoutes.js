
const express = require("express");
const router = express.Router();

const {
  getColors,
  getPublicColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
  bulkDeleteColors,
  updateColorStatus,
} = require("../controllers/colorController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicColors);
router.get("/public/:id", getColorById);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getColors);
router.get("/:id", authorizeMinRole("store_owner"), getColorById);
router.post("/", authorizeMinRole("store_owner"), createColor);
router.put("/:id", authorizeMinRole("store_owner"), updateColor);
router.put("/:id/status", authorizeMinRole("store_owner"), updateColorStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteColor);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteColors);

module.exports = router;
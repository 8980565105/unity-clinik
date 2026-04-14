const express = require("express");
const router = express.Router();

const {
  getSizes,
  getPublicSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
  bulkDeleteSizes,
  updateSizeStatus,
} = require("../controllers/sizeController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicSizes);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getSizes);
router.get("/:id", authorizeMinRole("store_owner"), getSizeById);
router.post("/", authorizeMinRole("store_owner"), createSize);
router.put("/:id", authorizeMinRole("store_owner"), updateSize);
router.put("/:id/status", authorizeMinRole("store_owner"), updateSizeStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteSize);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteSizes);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getTypes,
  getPublicTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  bulkDeleteTypes,
  updateTypeStatus,
} = require("../controllers/typeController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicTypes);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getTypes);
router.get("/:id", getTypeById);
router.post("/", authorizeMinRole("store_owner"), createType);
router.put("/:id", authorizeMinRole("store_owner"), updateType);
router.put("/:id/status", authorizeMinRole("store_owner"), updateTypeStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteType);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteTypes);

module.exports = router;
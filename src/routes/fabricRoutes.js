const express = require("express");
const router = express.Router();
const {
  getFabrics,
  getPublicFabrics,
  getFabricById,
  createFabric,
  updateFabric,
  deleteFabric,
  bulkDeleteFabrics,
  updateFabricStatus,
} = require("../controllers/fabricController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

const upload = require("../middlewares/upload");

router.get("/public", injectPublicStoreFilter, getPublicFabrics);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getFabrics);
router.get("/:id", authorizeMinRole("store_owner"), getFabricById);
router.post(
  "/",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  createFabric,
);
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  updateFabric,
);
router.put("/:id/status", authorizeMinRole("store_owner"), updateFabricStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteFabric);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteFabrics);

module.exports = router;
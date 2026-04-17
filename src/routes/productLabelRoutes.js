const express = require("express");
const router = express.Router();
const {
  getProductLabels,
  getPublicProductLabels,
  getProductLabelById,
  createProductLabel,
  updateProductLabel,
  deleteProductLabel,
  bulkDeleteProductLabels,
  updateProductLabelStatus,
} = require("../controllers/productLabelController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");


router.get("/public", injectPublicStoreFilter, getPublicProductLabels);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getProductLabels);
router.get("/:id", authorizeMinRole("store_owner"), getProductLabelById);
router.post("/", authorizeMinRole("store_owner"), createProductLabel);
router.put("/:id", authorizeMinRole("store_owner"), updateProductLabel);
router.put("/:id/status", authorizeMinRole("store_owner"), updateProductLabelStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteProductLabel);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteProductLabels);

module.exports = router;
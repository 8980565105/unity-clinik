const express = require("express");
const router = express.Router();

const {
  getDiscounts,
  getPublicDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  bulkDeleteDiscounts,
  updateDiscountStatus,
} = require("../controllers/discountController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicDiscounts);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getDiscounts);
router.get("/:id", authorizeMinRole("store_owner"), getDiscountById);
router.post("/", authorizeMinRole("store_owner"), createDiscount);
router.put("/:id", authorizeMinRole("store_owner"), updateDiscount);
router.put("/:id/status", authorizeMinRole("store_owner"), updateDiscountStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteDiscount);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteDiscounts);

module.exports = router;
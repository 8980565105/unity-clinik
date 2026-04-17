const express = require("express");
const router = express.Router();
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
} = require("../controllers/couponController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getCoupons);
router.use(authMiddleware);

router.get("/", getCoupons);
router.get("/:id", authorizeMinRole("store_owner"), getCouponById);
router.post("/", authorizeMinRole("store_owner"), createCoupon);
router.put("/:id", authorizeMinRole("store_owner"), updateCoupon);
router.put("/:id/status", authorizeMinRole("store_owner"), updateCouponStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteCoupon);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteCoupons);

module.exports = router;

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
  applyCoupon,
} = require("../controllers/couponController");

const {
  authMiddleware,
  authorizeMinRole,
  optionalAuthMiddleware,
} = require("../middlewares/authMiddleware");

router.get("/public", optionalAuthMiddleware, getCoupons);
router.use(authMiddleware);

router.get("/", getCoupons);
router.get("/:id", authorizeMinRole("admin"), getCouponById);
router.post("/", authorizeMinRole("admin"), createCoupon);
router.post("/apply", authMiddleware, applyCoupon);

router.put("/:id", authorizeMinRole("admin"), updateCoupon);
router.put("/:id/status", authorizeMinRole("admin"), updateCouponStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteCoupon);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteCoupons);

module.exports = router;

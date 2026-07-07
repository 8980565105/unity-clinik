const express = require("express");
const router = express.Router();
const {
  getOrderTracking,
  addTrackingAWB,
} = require("../controllers/orderController");
const {
  getOrders,
  getPublicUserOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  bulkDeleteOrders,
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  packOrder,
  generatePackingSlip,
  assignCourier,
  shipOrder,
  updateTracking,
  markDelivered,
  markRTO,
  generateInvoice,
} = require("../controllers/orderController");

const {
  authMiddleware,
  authorizeRoles,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", authMiddleware, getPublicUserOrders);
router.use(authMiddleware);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", authorizeMinRole("admin"), updateOrder);
router.put("/:id/status", authorizeMinRole("admin"), updateOrderStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteOrder);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteOrders);
router.put("/:id/cancel", authorizeMinRole("admin"), cancelOrder);
router.put("/:id/confirm", authorizeMinRole("admin"), confirmOrder);
router.put("/:id/pack", authorizeMinRole("admin"), packOrder);
router.patch("/:id/add-awb", authorizeMinRole("admin"), addTrackingAWB);
router.put("/:id/assign-courier", authorizeMinRole("admin"), assignCourier);
router.put("/:id/ship", authorizeMinRole("admin"), shipOrder);
router.put("/:id/tracking", authorizeMinRole("admin"), updateTracking);
router.put("/:id/deliver", authorizeMinRole("admin"), markDelivered);
router.put("/:id/rto", authorizeMinRole("admin"), markRTO);
router.get("/:id/packing-slip", authorizeMinRole("admin"), generatePackingSlip);
router.get("/:id/invoice", authorizeMinRole("admin"), generateInvoice);
router.get("/:id/tracking", authMiddleware, getOrderTracking);
module.exports = router;

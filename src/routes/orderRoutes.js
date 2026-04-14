const express = require("express");
const router = express.Router();
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
router.put("/:id", authorizeMinRole("store_user"), updateOrder);
router.put("/:id/status", authorizeMinRole("store_user"), updateOrderStatus);
router.delete("/:id", authorizeMinRole("store_user"), deleteOrder);
router.post("/bulk-delete", authorizeMinRole("store_user"), bulkDeleteOrders);
router.put("/:id/cancel", authorizeMinRole("store_user"), cancelOrder);
router.put("/:id/confirm", authorizeMinRole("store_user"), confirmOrder);
router.put("/:id/pack", authorizeMinRole("store_user"), packOrder);
router.put(
  "/:id/assign-courier",
  authorizeMinRole("store_user"),
  assignCourier,
);
router.put("/:id/ship", authorizeMinRole("store_user"), shipOrder);
router.put("/:id/tracking", authorizeMinRole("store_user"), updateTracking);
router.put("/:id/deliver", authorizeMinRole("store_user"), markDelivered);
router.put("/:id/rto", authorizeMinRole("store_user"), markRTO);
router.get(
  "/:id/packing-slip",
  authorizeMinRole("store_owner"),
  generatePackingSlip,
);
router.get("/:id/invoice", authorizeMinRole("store_owner"), generateInvoice);

module.exports = router;

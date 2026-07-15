const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  createPhonePePayment,
  verifyPhonePePayment,
  phonePeCallback,
  markPaymentFailed,
} = require("../controllers/paymentController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.post("/razorpay-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.post("/webhook", razorpayWebhook);

router.post("/phonepe/initiate", createPhonePePayment);
router.post("/phonepe/verify", verifyPhonePePayment);
router.post("/phonepe/callback", phonePeCallback);

router.use(authMiddleware);

router.get("/", authorizeMinRole("admin"), getPayments);
router.post("/mark-failed", markPaymentFailed);
router.get("/:id", authorizeMinRole("admin"), getPaymentById);
router.post("/", createPayment);
router.put("/:id", authorizeMinRole("admin"), updatePayment);
router.delete("/:id", authorizeMinRole("admin"), deletePayment);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeletePayments);

module.exports = router;

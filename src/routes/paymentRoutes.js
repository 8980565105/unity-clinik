

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

router.get("/", authorizeMinRole("store_owner"), getPayments);
router.get("/:id", authorizeMinRole("store_owner"), getPaymentById);
router.post("/", createPayment);
router.put("/:id", authorizeMinRole("store_owner"), updatePayment);
router.delete("/:id", authorizeMinRole("store_owner"), deletePayment);
router.post(
  "/bulk-delete",
  authorizeMinRole("store_owner"),
  bulkDeletePayments,
);

module.exports = router;

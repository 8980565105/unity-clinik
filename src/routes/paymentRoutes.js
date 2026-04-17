const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
} = require("../controllers/paymentController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

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

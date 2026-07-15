const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "partial"],
      default: "pending",
    },
    transaction_id: {
      type: String,
      required: false,
      default: "",
    },
    amount_paid: {
      type: Number,
      required: true,
      default: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
      default: null,
    },
    payment_date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["order", "wallet_recharge", "book_consultation"],
      required: true,
      default: "order",
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookconsaltion",
      required: false,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    points: {
      type: Number,
      required: true,
    },

    transaction_id: {
      type: String,
      default: null,
    },

    razorpay_order_id: {
      type: String,
      default: null,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    refUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, required: true, default: 0 },
    totalEarned: { type: Number, required: true, default: 0 },
    totalUsed: { type: Number, required: true, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wallet", walletSchema);

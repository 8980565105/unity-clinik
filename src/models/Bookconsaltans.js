const mongoose = require("mongoose");

const bookconsaltansSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, default: null },
    message: { type: String, default: null },
    phone: { type: String, required: true },
    type: {
      type: String,
      enum: ["voice call", "video call"],
      default: "voice call",
    },
    transaction_id: { type: String },
    amount: { type: Number },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    product_title: { type: String, default: null },
    slot_date: { type: String, default: null },
    slot_time: { type: String, default: null }, 
    slot_duration: { type: Number, default: null },
    slot_status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    is_redeemed: { type: Boolean, default: false },
    redeemed_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bookconsaltion", bookconsaltansSchema);

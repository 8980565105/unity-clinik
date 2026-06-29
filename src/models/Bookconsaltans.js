const mongoose = require("mongoose");

const bookconsaltansSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    type: {
      type: String,
      enum: ["voice call", "video call"],
      default: "voice call",
    },
    transaction_id: { type: String },
    amount: { type: Number },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    product_title: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bookconsaltion", bookconsaltansSchema);

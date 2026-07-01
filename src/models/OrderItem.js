const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
    },
    quantity: { type: Number, required: true },
    price_at_order: { type: Number, required: true },
    is_gift: { type: Boolean, default: false },
    is_consultation_gift: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OrderItem", orderItemSchema);

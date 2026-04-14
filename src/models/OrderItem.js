const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    quantity: { type: Number, required: true },
    price_at_order: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);

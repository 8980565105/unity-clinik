const mongoose = require("mongoose");

const packingItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  sku: { type: String, default: "" },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, default: 0 },
});

const pakingSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    order_number: { type: String, required: true },
    customer: {
      name: { type: String, required: true },
      mobile: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    shippingAddress: {
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      address: { type: String, default: "" },
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    items: [packingItemSchema],
    total_amount: { type: Number, required: true },
    total_weight: { type: Number, default: 0 },
    cod_amount: { type: Number, default: 0 },

    warehouse_name: { type: String, default: "" },
    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },

    packed_by: { type: String, default: "admin" },

    slip_generated: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Packing", pakingSchema);

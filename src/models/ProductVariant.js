const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    fabric_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fabric",
      required: true,
    },
    type_id: { type: mongoose.Schema.Types.ObjectId, ref: "Type" },

    color_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: true,
    },
    size_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      required: true,
    },

    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true },

    sku: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    images: [{ type: String }],

    labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductLabel" }],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    is_featured: { type: Boolean, default: false },
    is_best_seller: { type: Boolean, default: false },
    is_trending: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);

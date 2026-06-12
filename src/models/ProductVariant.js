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
    type_id: { type: mongoose.Schema.Types.ObjectId, ref: "Type" },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    steps: { type: String, default: "" },
    ProductWeight: { type: Number, required: true },
    ProductHeight: { type: Number, required: true },
    ProductWidth: { type: Number, required: true },
    ProductLength: { type: Number, required: true },
    CountryOrigin: { type: String, required: true },
    Marketed: { type: String, required: true },
    Manufactured: { type: String, required: true },
    barcode: { type: String, required: true },
    offerprice: { type: Number, required: true },
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

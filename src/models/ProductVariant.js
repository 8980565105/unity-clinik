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
    sku: { type: String, required: false, unique: true },
    steps: { type: String, default: "" },
    ProductWeight: { type: Number, required: false },
    ProductHeight: { type: Number, required: false },
    ProductWidth: { type: Number, required: false },
    ProductLength: { type: Number, required: false },
    CountryOrigin: { type: String, required: false },
    Marketed: { type: String, required: false },
    Manufactured: { type: String, required: false },
    barcode: { type: String, required: false },
    offerprice: { type: Number, required: false },
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

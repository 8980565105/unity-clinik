const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed", "freeshipping"],
      required: true,
    },
    discount_value: { type: Number, default: 0 },
    min_purchase_amount: { type: Number, default: 0 },
    max_discount_amount: { type: Number, default: null },
    usage_limit: { type: Number, default: null },
    used_count: { type: Number, default: 0 },
    start_date: { type: Date, required: false },
    end_date: { type: Date, required: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    apply_type: {
      type: String,
      enum: ["allproducts", "specificproducts", "specificsubcategory"],
      default: "allproducts",
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: "subCategory",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
couponSchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Coupon", couponSchema);

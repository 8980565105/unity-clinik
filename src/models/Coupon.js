const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    is_prepaid_only: {
      type: Boolean,
      default: false,
    },
    description: { type: String, required: false },
    header_title: {
      type: String,
      default: "",
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed", "freeshiping"],
      required: true,
    },
    coupon_type: {
      type: String,
      enum: [
        "normal",
        "first_order",
        "free_gift",
        "referral",
        "buy_x_get_y",
        "private",
      ],
      default: "normal",
    },

    gift_product_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    buy_x_get_y: {
      buy_quantity: {
        type: Number,
        default: 0,
      },
      get_quantity: {
        type: Number,
        default: 0,
      },
      free_products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
    },
    discount_value: { type: Number, default: 0 },
    min_purchase_amount: { type: Number, default: 0 },
    max_discount_amount: { type: Number, default: null },
    usage_limit: { type: Number, default: null },
    used_count: { type: Number, default: 0 },

    userusage_limit: { type: Number, default: 0 },
    user_usage: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
    start_date: { type: Date, required: false },
    end_date: { type: Date, required: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    apply_type: {
      type: String,
      enum: [
        "allproducts",
        "specificproducts",
        "specificsubcategory",
        "Excludeproduct",
        "Excludecategories",
      ],
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

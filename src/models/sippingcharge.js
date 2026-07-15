const mongoose = require("mongoose");

const rangeSchema = new mongoose.Schema(
  {
    from: { type: Number, required: true },
    to: { type: Number, required: true },
    chargeType: {
      type: String,
      enum: ["fixed", "percentage", "free_shipping"],
      default: "fixed",
    },
    charge: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const productRuleSchema = new mongoose.Schema(
  {
    applyTo: {
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
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    subCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "subcategory" },
    ],
    shippingType: {
      type: String,
      enum: ["price", "weight", "quntity"],
      default: "price",
    },
    paymentType: {
      type: String,
      enum: ["all", "cod", "partial", "prepaid", "wallet"],
      default: "all",
    },
    freeThreshold: { type: Number, default: 0 },
    ranges: { type: [rangeSchema], default: [] },
  },
  { _id: false },
);

const giftRuleSchema = new mongoose.Schema(
  {
    status: { type: Boolean, default: true },
    applyTo: {
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
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    subCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "subcategory" },
    ],
    minimumAmount: { type: Number, default: 0 },
    maximumAmount: { type: Number, default: 0 }, // 0 = no upper limit
    giftProduct: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    shortDescription: { type: String, default: "" },
    priority: { type: Number, default: 0 },
  },
  { _id: false },
);

const sippingchargeSchema = new mongoose.Schema(
  {
    shippingType: {
      type: String,
      enum: ["price", "weight", "quntity"],
      default: "price",
    },

    partialCod: {
      codType: {
        type: String,
        enum: ["fixed", "percentage"],
        default: "fixed",
      },
      value: { type: Number, default: 0 },
    },

    productRules: {
      cod: { type: [productRuleSchema], default: [] },
      prepaid: { type: [productRuleSchema], default: [] },
      partialCod: { type: [productRuleSchema], default: [] },
      wallet: { type: [productRuleSchema], default: [] },
    },
    giftRules: { type: [giftRuleSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("sippingcharge", sippingchargeSchema);

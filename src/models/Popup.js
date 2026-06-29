const mongoose = require("mongoose");

const couponPopupSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    couponCode: { type: String, default: "" },
    description: { type: String, default: "" },
    buttonText: { type: String, default: "SIGN UP" },
    discount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const consultationPopupSchema = new mongoose.Schema(
  {
    title1: { type: String, default: "" },
    title2: { type: String, default: "" },
    image: { type: String, default: "" },
    heading: { type: String, default: "" },
    price: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },
    description: { type: String, default: "" },
    buttonText: { type: String, default: "Book Consultation" },
  },
  { _id: false },
);

const bookConsultationPopupSchema = new mongoose.Schema(
  {
    productTitle: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    productPrice: { type: Number, default: 0 },
    productOfferPrice: { type: Number, default: 0 },
    tag: { type: String, default: "" },
    image: { type: String, default: "" },
    popupTitle: { type: String, default: "" },
    popupDescription: { type: String, default: "" },
    voicePrice: { type: Number, default: 0 },
    videoPrice: { type: Number, default: 0 },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  { _id: false },
);

const popupSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["coupon", "consultation", "BookConsultation"],
      default: "coupon",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    coupon: {
      type: couponPopupSchema,
      default: undefined,
    },

    consultation: {
      type: consultationPopupSchema,
      default: undefined,
    },

    BookConsultation: {
      type: bookConsultationPopupSchema,
      default: undefined,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Popup", popupSchema);

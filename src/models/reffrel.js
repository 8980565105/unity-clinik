const mongoose = require("mongoose");

const walletOfferSchema = new mongoose.Schema(
  {
    minAmount: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
    chargeType: {
      type: String,
      enum: ["fixed", "percentage", "free_shipping"],
      default: "fixed",
    },
    charge: { type: Number, default: 0 },
  },
  { _id: false },
);

const walletBoxSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    chargeType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "fixed",
    },
    charge: { type: Number, default: 0 },
    badge: { type: String, default: "" },
  },
  { _id: false },
);

const pointSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  { _id: false },
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
  },
  { _id: false },
);

const reffrelSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "referral" },
    referrerPoints: { type: Number, default: 0 },
    refereePoints: { type: Number, default: 0 },
    walletOffers: {
      type: [walletOfferSchema],
      default: () => [
        { minAmount: 100, bonusPoints: 0, chargeType: "fixed", charge: 0 },
      ],
    },
    walletbox: {
      type: [walletBoxSchema],
      default: () => [
        { amount: 910, chargeType: "percentage", charge: 10, badge: "" },
        {
          amount: 2500,
          chargeType: "percentage",
          charge: 20,
          badge: "Most preferred",
        },
        {
          amount: 5000,
          chargeType: "percentage",
          charge: 30,
          badge: "Best value offer",
        },
      ],
    },

    points: {
      type: [pointSchema],
      default: () => [],
    },

    faqs: {
      type: [faqSchema],
      default: () => [
        {
          question: "What is the Wallet?",
          answer:
            "Your wallet recharge balance, coins earned from tasks, purchases, and referrals are all collected here — which can be used to save money on your next purchase.",
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("reffrel", reffrelSchema);

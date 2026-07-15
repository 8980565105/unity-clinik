
  const mongoose = require("mongoose");

  const walletOfferSchema = new mongoose.Schema(
    {
      minAmount: { type: Number, default: 0 },
      bonusPoints: { type: Number, default: 0 },
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
        default: () => [{ minAmount: 100, bonusPoints: 0 }],
      },
    },
    { timestamps: true },
  );

  module.exports = mongoose.model("reffrel", reffrelSchema);

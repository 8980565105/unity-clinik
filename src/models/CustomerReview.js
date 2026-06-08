const mongoose = require("mongoose");

const customerReviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: false },
  is_approved: { type: Boolean, default: false },
  beforeImage: { type: String, default: "" },
  afterImage: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

customerReviewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("CustomerReview", customerReviewSchema);

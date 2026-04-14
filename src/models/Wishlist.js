
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
          required: false,
        },
        store_owner_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
          default: null,
        },
        created_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
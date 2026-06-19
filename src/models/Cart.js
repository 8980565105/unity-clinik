const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    pack_of: {
      type: Number,
      default: 1,
    },

    price: {
      type: Number,
      default: 0,
    },

    original_price: {
      type: Number,
      default: 0,
    },

  },
  { _id: true },
);

// const cartSchema = new mongoose.Schema(
//   {
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [cartItemSchema],
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Cart", cartSchema);

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guest_id: {
      type: String,
      default: null,
    },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

// Index for fast lookup
cartSchema.index({ guest_id: 1 });
cartSchema.index({ user_id: 1 });
module.exports = mongoose.model("Cart", cartSchema);

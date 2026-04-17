// const mongoose = require("mongoose");

// const offerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     title: { type: String },
//     description: { type: String },
//     image_url: { type: String },

//     // 🔥 NEW FIELDS
//     discount_type: {
//       type: String,
//       enum: ["percentage", "fixed"],
//       default: "percentage",
//     },
//     discount_value: { type: Number },

//     min_purchase: { type: Number, default: 0 },
//     max_discount: { type: Number },

//     start_date: { type: Date },
//     end_date: { type: Date },

//     storeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Store",
//       default: null,
//     },

//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Offer", offerSchema);
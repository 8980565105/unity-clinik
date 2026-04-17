const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    order_number: { type: String },
    message: { type: String, required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ContactUs", contactUsSchema);

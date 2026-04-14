const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true,},
    code: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
      storeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
          default: null,
          index: true,
        },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
colorSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Color", colorSchema);

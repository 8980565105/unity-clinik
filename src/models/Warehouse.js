const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
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

warehouseSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Warehouse", warehouseSchema);

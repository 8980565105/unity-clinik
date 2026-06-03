const mongoose = require("mongoose");

const resultsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    after_image_url: { type: String, required: true },
    before_image_url: { type: String, required: true },
    age: { type: Number },
    gander: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

resultsSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultsSchema);

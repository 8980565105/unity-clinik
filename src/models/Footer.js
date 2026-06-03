const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Footer", footerSchema);

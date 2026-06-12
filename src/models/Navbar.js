const mongoose = require("mongoose");

const navbarSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
    icon: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

navbarSchema.pre("save", function (next) {
  if (this.order == null) this.order = 1;
});

module.exports = mongoose.model("Navbar", navbarSchema);


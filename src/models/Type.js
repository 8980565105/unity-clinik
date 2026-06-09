const mongoose = require("mongoose");
const slugify = require("slugify");

const typeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

typeSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

typeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Type", typeSchema);

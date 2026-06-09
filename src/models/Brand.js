const mongoose = require("mongoose");
const slugify = require("slugify");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    image_url: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },

  { timestamps: true },
);

brandSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

brandSchema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model("Brand", brandSchema);

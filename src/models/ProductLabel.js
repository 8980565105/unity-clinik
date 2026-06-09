const mongoose = require("mongoose");
const slugify = require("slugify");

const productLabelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    color: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

  },
  { timestamps: true },
);

productLabelSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

productLabelSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("ProductLabel", productLabelSchema);

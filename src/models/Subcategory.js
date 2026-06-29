const mongoose = require("mongoose");
const slugify = require("slugify");

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    image_url: { type: String, default: null },
    order: {
      type: Number,
      default: 0,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Parent category is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true },
);

subcategorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});
subcategorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("subCategory", subcategorySchema);

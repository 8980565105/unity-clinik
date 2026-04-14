const mongoose = require("mongoose");
const slugify = require("slugify");

const fabricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    image_url: { type: String, default: null },
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

fabricSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // next();
});

fabricSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Fabric", fabricSchema);

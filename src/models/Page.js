const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  image_url: { type: String },
  background_image_url: { type: String },
  is_button: { type: Boolean, default: false },
  button_name: { type: String },
  button_link: { type: String },
  order: { type: Number, default: 1 },
});

const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hero_slider", "content", "feature"],
      default: "content",
      required: true,
    },
    title: { type: String },
    description: { type: String },
    image_url: { type: String },
    background_image_url: { type: String },
    order: { type: Number, default: 1 },
    is_button: { type: Boolean, default: false },
    button_name: { type: String },
    button_link: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slides: [slideSchema],
  },
  { timestamps: true },
);

const pageSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    page_name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    sections: [sectionSchema],
    meta_title: { type: String },
    meta_description: { type: String },
    meta_keyphrase: { type: String },
    seo_image: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    order: { type: Number, default: 1 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

pageSchema.index(
  { slug: 1, storeId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { storeId: { $type: "objectId" } },
  },
);

pageSchema.pre("validate", function (next) {
  if (!this.slug && this.page_name) {
    this.slug = this.page_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  // next();
});

module.exports = mongoose.model("Page", pageSchema);

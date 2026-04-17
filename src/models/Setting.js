const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const settingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },

    site_name: { type: String },
    logo_url: { type: String },
    favicon_url: { type: String },
    primary_color: { type: String },
    secondary_color: { type: String },
    button_color: { type: String },
    font_family: { type: String },

    meta_title: { type: String },
    meta_description: { type: String },
    meta_keyphrase: { type: String },
    seo_image: { type: String },

    footer_text: { type: String },
    copyright_text: { type: String },

    contact_email: { type: String },
    contact_phone: { type: String },
    contact_address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postal_code: { type: String },
    },

    social_links: [socialLinkSchema],
    custom_css: { type: String },
    custom_js: { type: String },
  },
  { timestamps: true },
);

settingSchema.index({ storeId: 1 }, { unique: true, sparse: true });
settingSchema.index({ user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Setting", settingSchema);

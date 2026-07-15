const mongoose = require("mongoose");
 
const pageVisitSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    page_url: { type: String, required: true }, // e.g. "/product/123", "/cart"
    page_title: { type: String, default: "" }, // e.g. "Product Detail", "Checkout"
    referrer: { type: String, default: "" },
    device: {
      type: { type: String, default: null }, // Desktop/Mobile/Tablet
      browser: { type: String, default: null },
      os: { type: String, default: null },
      ip: { type: String, default: null },
    },
    visited_at: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
 
// Auto-delete visits older than 90 days (optional, keeps collection light)
pageVisitSchema.index({ visited_at: 1 }, { expireAfterSeconds: 7776000 });
 
module.exports = mongoose.model("PageVisit", pageVisitSchema);
 
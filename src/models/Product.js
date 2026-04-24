const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    steps: { type: String },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },

    images: [{ type: String }],

    slug: { type: String, required: true },

    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },

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
    sections: [
      {
        type: { type: String },
        data: {
          status: { type: Boolean, default: true },
          title: { type: String },
          description: { type: String },
          image: { type: String },
          items: [
            {
              name: { type: String },
              description: { type: String },
              image: { type: String },
              product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                default: null,
              },
            },
          ],
        },
      },
    ],
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

productSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);

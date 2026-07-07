const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },

    steps: {
      type: String,
      default: "",
    },

    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategory",
        required: true,
      },
    ],

    images: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    ishidden: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: null,
    },

    sections: [
      {
        type: {
          type: String,
          default: "",
        },

        data: {
          status: {
            type: Boolean,
            default: true,
          },

          title: {
            type: String,
            default: "",
          },

          description: {
            type: String,
            default: "",
          },

          image: {
            type: String,
            default: "",
          },

          questions: [
            {
              _id: false,

              question: {
                type: String,
                default: "",
              },

              answer: {
                type: String,
                default: "",
              },

              image: {
                type: String,
                default: "",
              },
            },
          ],

          items: [
            {
              name: {
                type: String,
                default: "",
              },

              title: {
                type: String,
                default: "",
              },

              description: {
                type: String,
                default: "",
              },

              image: {
                type: String,
                default: "",
              },

              beforeImage: {
                type: String,
                default: "",
              },

              afterImage: {
                type: String,
                default: "",
              },

              product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                default: null,
              },

              usPoint: {
                type: String,
                default: "",
              },

              otherPoint: {
                type: String,
                default: "",
              },

              key: {
                type: String,
                default: "",
              },
              value: {
                type: String,
                default: "",
              },
              net_quantity: {
                type: String,
                default: "",
              },
              manufactured_by: {
                type: String,
                default: "",
              },
              country_origin: {
                type: String,
                default: "",
              },
              product_dimensions: {
                type: String,
                default: "",
              },
              best_before: {
                type: String,
                default: "",
              },
              marketed_by: {
                type: String,
                default: "",
              },

              reviewDescription: {
                type: String,
                default: "",
              },
              customerName: {
                type: String,
                default: "",
              },
              customerAge: {
                type: String,
                default: "",
              },
              verifiedReview: {
                type: Boolean,
                default: true,
              },
              stageLabel: {
                type: String,
                default: "",
              },
            },
          ],

          steps: [
            {
              status: {
                type: Boolean,
                default: true,
              },

              title: {
                type: String,
                default: "",
              },

              display_type: {
                type: String,
                enum: ["Text", "Text with img", "Upgrade Product", "Pack"],
                default: "Text",
              },

              description: {
                type: String,
                default: "",
              },

              variants: [
                {
                  title: String,
                  description: String,
                  image: String,

                  slug: {
                    type: String,
                    default: "",
                  },

                  product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    default: null,
                  },

                  price: {
                    type: Number,
                    default: 0,
                  },

                  offerprice: {
                    type: Number,
                    default: 0,
                  },

                  badge: {
                    type: String,
                    default: "",
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

productSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);

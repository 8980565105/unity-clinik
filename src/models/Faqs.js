
const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      default: null,
    },

    question: {
      type: String,
      required: false,
    },

    answer: {
      type: String,
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

    banner: {
      image: {
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
    },
  },
  { timestamps: true },
);

faqSchema.index({ question: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("FAQ", faqSchema);

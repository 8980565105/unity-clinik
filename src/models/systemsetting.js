const mongoose = require("mongoose");

const rangeSchema = new mongoose.Schema(
  {
    from: {
      type: Number,
      required: true,
    },

    to: {
      type: Number,
      required: true,
    },

    chargeType: {
      type: String,
      enum: ["fixed", "percentage", "free_shipping"],
      default: "fixed",
    },

    charge: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);

const systemSettingSchema = new mongoose.Schema(
  {
    

    razorpaykey: {
      type: String,
      default: "",
    },

    razorpaysecretkey: {
      type: String,
      default: "",
    },

    phonepe: {
      merchantId: {
        type: String,
        default: "",
      },

      merchantUserId: {
        type: String,
        default: "",
      },

      env: {
        type: String,
        default: "",
      },

      saltKey: {
        type: String,
        default: "",
      },

      saltIndex: {
        type: String,
        default: "",
      },

      callbackUrl: {
        type: String,
        default: "",
      },
    },

    ithink: {
      token: {
        type: String,
        default: "",
      },

      secret: {
        type: String,
        default: "",
      },

      apiUrl: {
        type: String,
        default: "",
      },

      pickupAddressId: {
        type: String,
        default: "",
      },
    },

    prepaid: {
      freeThreshold: {
        type: Number,
        default: 0,
      },

      ranges: {
        type: [rangeSchema],
        default: [],
      },
    },

    cod: {
      freeThreshold: {
        type: Number,
        default: 0,
      },

      ranges: {
        type: [rangeSchema],
        default: [],
      },
    },

    partialCod: {
      codType: {
        type: String,
        enum: ["fixed", "percentage", "range"],
        default: "fixed",
      },

      value: {
        type: Number,
        default: 0,
      },
    },

    general: {
      termService: {
        type: String,
        default: "",
      },

      privacyPolicy: {
        type: String,
        default: "",
      },

      refundPolicy: {
        type: String,
        default: "",
      },

      aboutUs: {
        type: String,
        default: "",
      },

      shippingPolicy: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);

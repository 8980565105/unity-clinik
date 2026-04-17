const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_price: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "packed",
        "ready_to_ship",
        "shipped",
        "in_transit",
        "completed",
        "cancelled",
        "rto",
        "returned",
        "refunded",
      ],
      default: "pending",
    },

    shippingAddress: {
      firstName: String,
      lastName: String,
      address: String,
      state: String,
      city: String,
      pincode: String,
      phone: String,
    },

    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },

    order_number: { type: String, unique: true },

    payment_method: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transaction_id: { type: String, default: "" },

    admin_note: { type: String, default: "" },
    cancel_reason: { type: String, default: "" },

    packing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Packing",
      default: null,
    },

    courier: {
      partner: {
        type: String,
        enum: ["Delhivery", "Blue Dart", "DTDC", "Shiprocket", "Custom", ""],
        default: "",
      },
      name: { type: String, default: "" },
      awb_number: { type: String, default: "" },
      tracking_url: { type: String, default: "" },
      pickup_date: { type: Date },
      dispatched_at: { type: Date },
      delivered_at: { type: Date },
    },

    status_history: [
      {
        status: String,
        changed_at: { type: Date, default: Date.now },
        changed_by: { type: String, default: "admin" },
        note: { type: String, default: "" },
      },
    ],
    store_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    invoice_generated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

orderSchema.pre("save", async function (next) {
  if (!this.order_number) {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const datePart = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 8);
    this.order_number = `ORD-${datePart}-${randomPart}`;
  }
  // next();
});

module.exports = mongoose.model("Order", orderSchema);

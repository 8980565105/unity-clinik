
const generateReferralCode = (name) => {
  const base =
    (name || "USER")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 6) || "USER";
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${base}${rand}`;
};

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
  {
    house: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    zip_code: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    fullName: { type: String, default: "" },
  },
  { _id: true },
);

// 👇 NEW: schema for a single device/login snapshot
const deviceSchema = new mongoose.Schema(
  {
    type: { type: String, default: null }, // Desktop / Mobile / Tablet
    browser: { type: String, default: null },
    os: { type: String, default: null },
    ip: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    zip_code: { type: String, default: null }, // 👈 NEW - pincode
    latitude: { type: Number, default: null }, // 👈 NEW
    longitude: { type: Number, default: null }, // 👈 NEW
  },
  { _id: false },
);
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: false, default: null },

    password: { type: String, required: false, default: null },

    role: { type: String, enum: ["admin", "user"], default: "user" },

    domain: { type: String, default: "", index: true },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },

    authProvider: {
      type: String,
      enum: ["email", "phone", "google"],
      default: "email",
    },

    mobile_number: { type: String },

    profile_picture: { type: String },

    addresses: { type: [addressSchema], default: [] },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gender: { type: String, enum: ["male", "female", "other"] },

    date_of_birth: { type: Date },

    is_active: { type: Boolean, default: true },

    lastLogin: { type: Date, default: null },

    // 👇 NEW: tracking fields
    loginCount: { type: Number, default: 0 },

    lastDevice: { type: deviceSchema, default: () => ({}) },

    // keep the last 20 logins for a history view
    loginHistory: {
      type: [
        {
          type: { type: String, default: null },
          browser: { type: String, default: null },
          os: { type: String, default: null },
          ip: { type: String, default: null },
          city: { type: String, default: null },
          state: { type: String, default: null },
          country: { type: String, default: null },
          zip_code: { type: String, default: null }, // 👈 NEW
          latitude: { type: Number, default: null }, // 👈 NEW
          longitude: { type: Number, default: null }, // 👈 NEW
          loggedInAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { email: 1, storeId: 1 },
  { unique: true, name: "unique_email_per_store" },
);

userSchema.pre("save", async function () {
  if (this.isNew && !this.referralCode) {
    let code;
    let exists = true;
    while (exists) {
      code = generateReferralCode(this.name);
      exists = await mongoose.models.User.findOne({ referralCode: code });
    }
    this.referralCode = code;
  }

  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);

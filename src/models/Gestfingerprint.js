const mongoose = require("mongoose");

const guestFingerprintSchema = new mongoose.Schema(
  {
    guest_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fingerprint_hash: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    last_seen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

guestFingerprintSchema.index(
  { last_seen: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

module.exports = mongoose.model("GuestFingerprint", guestFingerprintSchema);

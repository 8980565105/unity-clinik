// const GuestFingerprint = require("../models/Gestfingerprint");
const GuestFingerprint = require("../models/Gestfingerprint");
const { sendResponse } = require("../utils/response");
const crypto = require("crypto");

/**
 * POST /api/guest/resolve
 * Body: { fingerprintHash: string }
 * Returns: { guest_id: string, isNew: boolean }
 *
 * Flow:
 * 1. If fingerprintHash matches existing record → return same guest_id (recovery!)
 * 2. If no match → create new guest_id + save mapping
 */
const resolveGuestId = async (req, res) => {
  try {
    const { fingerprintHash } = req.body;

    if (!fingerprintHash || typeof fingerprintHash !== "string") {
      return sendResponse(res, false, null, "fingerprintHash is required");
    }

    // Sanitize: max 128 chars, alphanumeric only
    const hash = fingerprintHash.slice(0, 128).replace(/[^a-z0-9]/g, "");
    if (!hash) return sendResponse(res, false, null, "Invalid fingerprintHash");

    // Try to find existing guest by fingerprint
    const existing = await GuestFingerprint.findOne({ fingerprint_hash: hash });

    if (existing) {
      // Update last_seen for TTL reset
      existing.last_seen = new Date();
      await existing.save();
      return sendResponse(
        res,
        true,
        { guest_id: existing.guest_id, isNew: false },
        "Guest recovered",
      );
    }

    // Create new guest_id
    const randomPart =
      crypto.randomBytes(6).toString("hex") +
      Math.random().toString(36).substring(2, 8);
    const guest_id = `guest_${randomPart}`;

    await GuestFingerprint.create({
      guest_id,
      fingerprint_hash: hash,
      last_seen: new Date(),
    });

    return sendResponse(res, true, { guest_id, isNew: true }, "Guest created");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      err.message || "Guest resolve failed",
    );
  }
};

module.exports = { resolveGuestId };

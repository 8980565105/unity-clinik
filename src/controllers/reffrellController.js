const Reffrel = require("../models/reffrel");
const { sendResponse } = require("../utils/response");

const getReferralSettings = async (req, res) => {
  try {
    let settings = await Reffrel.findOne({ key: "referral" });
    if (!settings) settings = await Reffrel.create({ key: "referral" });
    return sendResponse(res, true, settings, "Fetched referral settings");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const updateReferralSettings = async (req, res) => {
  try {
    const { referrerPoints, refereePoints, walletOffers } = req.body;

    if (referrerPoints == null || refereePoints == null)
      return sendResponse(
        res,
        false,
        null,
        "referrerPoints and refereePoints are required",
      );

    let cleanWalletOffers;
    if (Array.isArray(walletOffers)) {
      cleanWalletOffers = walletOffers.map((o) => ({
        minAmount: Math.max(0, Number(o.minAmount) || 0),
        bonusPoints: Math.max(0, Number(o.bonusPoints) || 0),
      }));
    }

    const updatePayload = {
      referrerPoints: Math.max(0, Number(referrerPoints)),
      refereePoints: Math.max(0, Number(refereePoints)),
    };
    if (cleanWalletOffers) updatePayload.walletOffers = cleanWalletOffers;

    const settings = await Reffrel.findOneAndUpdate(
      { key: "referral" },
      updatePayload,
      { returnDocument: "after", upsert: true },
    );
    return sendResponse(res, true, settings, "Referral settings updated");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = { getReferralSettings, updateReferralSettings };

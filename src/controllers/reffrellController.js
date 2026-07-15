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
    const {
      referrerPoints,
      refereePoints,
      walletOffers,
      walletbox,
      points, 
      faqs,
    } = req.body;

    if (referrerPoints == null || refereePoints == null)
      return sendResponse(
        res,
        false,
        null,
        "referrerPoints and refereePoints are required",
      );

    const allowedOfferChargeTypes = ["fixed", "percentage", "free_shipping"];
    const allowedBoxChargeTypes = ["fixed", "percentage"];

    let cleanWalletOffers;
    if (Array.isArray(walletOffers)) {
      cleanWalletOffers = walletOffers.map((o) => ({
        minAmount: Math.max(0, Number(o.minAmount) || 0),
        bonusPoints: Math.max(0, Number(o.bonusPoints) || 0),
        chargeType: allowedOfferChargeTypes.includes(o.chargeType)
          ? o.chargeType
          : "fixed",
        charge: Math.max(0, Number(o.charge) || 0),
      }));
    }

    let cleanWalletBox;
    if (Array.isArray(walletbox)) {
      cleanWalletBox = walletbox.map((b) => ({
        amount: Math.max(0, Number(b.amount) || 0),
        chargeType: allowedBoxChargeTypes.includes(b.chargeType)
          ? b.chargeType
          : "fixed",
        charge: Math.max(0, Number(b.charge) || 0),
        badge: typeof b.badge === "string" ? b.badge : "",
      }));
    }

    let cleanPoints; 
    if (Array.isArray(points)) {
      cleanPoints = points
        .map((p) => ({
          image: typeof p.image === "string" ? p.image : "",
          text: typeof p.text === "string" ? p.text.trim() : "",
        }))
        .filter((p) => p.text.length > 0);
    }

    let cleanFaqs;
    if (Array.isArray(faqs)) {
      cleanFaqs = faqs
        .map((f) => ({
          question: typeof f.question === "string" ? f.question.trim() : "",
          answer: typeof f.answer === "string" ? f.answer.trim() : "",
        }))
        .filter((f) => f.question.length > 0);
    }

    const updatePayload = {
      referrerPoints: Math.max(0, Number(referrerPoints)),
      refereePoints: Math.max(0, Number(refereePoints)),
    };
    if (cleanWalletOffers) updatePayload.walletOffers = cleanWalletOffers;
    if (cleanWalletBox) updatePayload.walletbox = cleanWalletBox;
    if (cleanPoints) updatePayload.points = cleanPoints; 
    if (cleanFaqs) updatePayload.faqs = cleanFaqs;

    const settings = await Reffrel.findOneAndUpdate(
      { key: "referral" },
      updatePayload,
      { new: true, upsert: true },
    );
    return sendResponse(res, true, settings, "Referral settings updated");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = { getReferralSettings, updateReferralSettings };

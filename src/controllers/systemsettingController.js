const SystemSettingModel = require("../models/systemsetting");
const User = require("../models/User");
const { sendResponse } = require("../utils/response");

const getStoreId = async (req) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return null;

  const user = await User.findById(userId).select("storeId _id");
  return user?.storeId || user?._id;
};

const getUserSettings = async (req, res) => {
  try {
    let settings = await SystemSettingModel.findOne({});
    if (!settings) {
      settings = {
        razorpaykey: "",
        razorpaysecretkey: "",
        phonepe: {
          merchantId: "",
          merchantUserId: "",
          env: "",
          saltKey: "",
          saltIndex: "",
          callbackUrl: "",
        },
        ithink: { token: "", secret: "", apiUrl: "", pickupAddressId: "" },
        prepaid: { freeThreshold: 0, ranges: [] },
        cod: { freeThreshold: 0, ranges: [] },
        partialCod: { codType: "fixed", value: 0 },
        general: {
          termService: "",
          privacyPolicy: "",
          refundPolicy: "",
          aboutUs: "",
          shippingPolicy: "",
        },
      };
    }
    return sendResponse(res, true, settings, "Settings fetched successfully");
  } catch (error) {
    return sendResponse(res, false, null, "Internal server error");
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const {
      razorpaykey,
      razorpaysecretkey,
      phonepe,
      ithink,
      prepaid,
      cod,
      partialCod,
      general,
    } = req.body;

    const validateRanges = (ranges = [], label) => {
      const filteredRanges = ranges.filter((r) => {
        return r.from !== "" || r.to !== "" || r.charge !== "";
      });

      for (let i = 0; i < filteredRanges.length; i++) {
        const r = filteredRanges[i];

        if (r.from === undefined || r.from === "") {
          return `${label} range ${i + 1}: From is required`;
        }

        if (r.to === undefined || r.to === "") {
          return `${label} range ${i + 1}: To is required`;
        }

        const from = Number(r.from);

        const to = Number(r.to);

        if (isNaN(from) || isNaN(to)) {
          return `${label} range ${i + 1}: Invalid amount`;
        }

        if (to <= from) {
          return `${label} range ${i + 1}: To must be greater than From`;
        }

        if (!["fixed", "percentage", "free_shipping"].includes(r.chargeType)) {
          return `${label} range ${i + 1}: Invalid charge type`;
        }

        if (r.chargeType !== "free_shipping") {
          if (r.charge === undefined || r.charge === "") {
            return `${label} range ${i + 1}: Charge is required`;
          }

          const charge = Number(r.charge);

          if (isNaN(charge) || charge < 0) {
            return `${label} range ${i + 1}: Invalid charge`;
          }
        }

        if (r.chargeType === "percentage") {
          const pct = Number(r.charge);

          if (pct < 0 || pct > 100) {
            return `${label} range ${
              i + 1
            }: Percentage must be between 0 and 100`;
          }
        }
      }

      return null;
    };

    const prepaidErr = validateRanges(prepaid?.ranges, "Prepaid");
    if (prepaidErr) return sendResponse(res, false, null, prepaidErr);

    const codErr = validateRanges(cod?.ranges, "COD");
    if (codErr) return sendResponse(res, false, null, codErr);

    if (phonepe?.callbackUrl) {
      try {
        new URL(phonepe.callbackUrl);
      } catch {
        return sendResponse(
          res,
          false,
          null,
          "PhonePe Callback URL is invalid",
        );
      }
    }

    if (ithink?.apiUrl) {
      try {
        new URL(ithink.apiUrl);
      } catch {
        return sendResponse(res, false, null, "iThink API URL is invalid");
      }
    }

    const allowedCodTypes = ["fixed", "percentage", "range"];
    if (partialCod?.codType && !allowedCodTypes.includes(partialCod.codType))
      return sendResponse(res, false, null, "Invalid partialCod codType");

    if (partialCod?.codType === "percentage") {
      const pct = Number(partialCod.value);
      if (isNaN(pct) || pct < 0 || pct > 100)
        return sendResponse(
          res,
          false,
          null,
          "Percentage value must be between 0 and 100",
        );
    }

    const updateData = {
      razorpaykey: razorpaykey || "",
      razorpaysecretkey: razorpaysecretkey || "",
      "phonepe.merchantId": phonepe?.merchantId || "",
      "phonepe.merchantUserId": phonepe?.merchantUserId || "",
      "phonepe.env": phonepe?.env || "",
      "phonepe.saltKey": phonepe?.saltKey || "",
      "phonepe.saltIndex": phonepe?.saltIndex || "",
      "phonepe.callbackUrl": phonepe?.callbackUrl || "",
      "ithink.token": ithink?.token || "",
      "ithink.secret": ithink?.secret || "",
      "ithink.apiUrl": ithink?.apiUrl || "",
      "ithink.pickupAddressId": ithink?.pickupAddressId || "",
      "prepaid.freeThreshold": Number(prepaid?.freeThreshold) || 0,

      "prepaid.ranges": (prepaid?.ranges || [])
        .filter((r) => r.from !== "" || r.to !== "" || r.charge !== "")
        .map((r) => ({
          from: Number(r.from),

          to: Number(r.to),

          chargeType: r.chargeType || "fixed",

          charge: r.chargeType === "free_shipping" ? 0 : Number(r.charge) || 0,
        })),

      "cod.ranges": (cod?.ranges || [])
        .filter((r) => r.from !== "" || r.to !== "" || r.charge !== "")
        .map((r) => ({
          from: Number(r.from),

          to: Number(r.to),

          chargeType: r.chargeType || "fixed",

          charge: r.chargeType === "free_shipping" ? 0 : Number(r.charge) || 0,
        })),

      "cod.freeThreshold": Number(cod?.freeThreshold) || 0,

      "partialCod.codType": partialCod?.codType || "fixed",
      "partialCod.value": Number(partialCod?.value) || 0,
      "general.termService": general?.termService || "",
      "general.privacyPolicy": general?.privacyPolicy || "",
      "general.refundPolicy": general?.refundPolicy || "",
      "general.aboutUs": general?.aboutUs || "",
      "general.shippingPolicy": general?.shippingPolicy || "",
    };

    const updatedDoc = await SystemSettingModel.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      },
    );

    return sendResponse(res, true, updatedDoc, "Settings saved successfully");
  } catch (error) {
    return sendResponse(
      res,
      false,
      null,
      error.message || "Internal server error",
    );
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const settings = await SystemSettingModel.findOne({}).select(
      "general prepaid cod partialCod",
    );

    if (!settings) {
      return sendResponse(
        res,
        true,
        {
          general: {
            termService: "",
            privacyPolicy: "",
            refundPolicy: "",
            aboutUs: "",
            shippingPolicy: "",
          },
          prepaid: {
            freeThreshold: 0,
            ranges: [],
          },
          cod: {
            freeThreshold: 0,
            ranges: [],
          },
          partialCod: {
            codType: "fixed",
            value: 0,
          },
        },
        "Default public settings",
      );
    }

    return sendResponse(
      res,
      true,
      settings,
      "Public settings fetched successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, "Internal server error");
  }
};
module.exports = { getUserSettings, updateUserSettings, getPublicSettings };

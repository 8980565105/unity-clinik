const sippingchargeModel = require("../models/sippingcharge");
const { sendResponse } = require("../utils/response");

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const defaultSettings = () => ({
  shippingType: "price",
  partialCod: { codType: "fixed", value: 0 },
  productRules: { cod: [], prepaid: [], partialCod: [] },
});

const sanitizeRanges = (ranges = []) => {
  if (!Array.isArray(ranges)) return [];
  return ranges.map((r) => ({
    from: toNumber(r.from),
    to: toNumber(r.to),
    chargeType: ["fixed", "percentage", "free_shipping"].includes(r.chargeType)
      ? r.chargeType
      : "fixed",
    charge: r.chargeType === "free_shipping" ? 0 : toNumber(r.charge),
  }));
};

const validateRanges = (ranges = [], label = "") => {
  const errors = [];
  ranges.forEach((r, i) => {
    if (r.from === undefined || r.from === null || isNaN(r.from)) {
      errors.push(`${label} range #${i + 1}: "From" is required`);
    }
    if (r.to === undefined || r.to === null || isNaN(r.to)) {
      errors.push(`${label} range #${i + 1}: "To" is required`);
    }
    if (!isNaN(r.from) && !isNaN(r.to) && Number(r.to) <= Number(r.from)) {
      errors.push(`${label} range #${i + 1}: "To" must be greater than "From"`);
    }
    if (
      r.chargeType !== "free_shipping" &&
      (r.charge === undefined || r.charge === null || isNaN(r.charge))
    ) {
      errors.push(`${label} range #${i + 1}: Charge is required`);
    }
    if (r.chargeType === "percentage" && Number(r.charge) > 100) {
      errors.push(
        `${label} range #${i + 1}: Percentage charge cannot exceed 100`,
      );
    }
  });
  return errors;
};

const sanitizeRule = (rule = {}) => ({
  applyTo: [
    "allproducts",
    "specificproducts",
    "specificsubcategory",
    "Excludeproduct",
    "Excludecategories",
  ].includes(rule.applyTo)
    ? rule.applyTo
    : "allproducts",
  products: Array.isArray(rule.products) ? rule.products : [],
  subCategories: Array.isArray(rule.subCategories) ? rule.subCategories : [],
  shippingType: ["price", "weight", "quntity"].includes(rule.shippingType)
    ? rule.shippingType
    : "price",

  paymentType: ["all", "cod", "partial", "prepaid"].includes(rule.paymentType)
    ? rule.paymentType
    : "all",

  freeThreshold: toNumber(rule.freeThreshold),
  ranges: sanitizeRanges(rule.ranges),
});

const validateRule = (rule, label, index) => {
  const errors = [];
  if (
    (rule.applyTo === "specificproducts" ||
      rule.applyTo === "Excludeproduct") &&
    rule.products.length === 0
  ) {
    errors.push(`${label} rule #${index + 1}: at least one product required`);
  }
  if (
    (rule.applyTo === "specificsubcategory" ||
      rule.applyTo === "Excludecategories") &&
    rule.subCategories.length === 0
  ) {
    errors.push(
      `${label} rule #${index + 1}: at least one subcategory required`,
    );
  }
  errors.push(...validateRanges(rule.ranges, `${label} rule #${index + 1}`));
  return errors;
};

const getShippingCharge = async (req, res) => {
  try {
    let settings = await sippingchargeModel.findOne();
    if (!settings) {
      return sendResponse(
        res,
        true,
        defaultSettings(),
        "No shipping charge configured yet",
      );
    }
    return sendResponse(
      res,
      true,
      settings,
      "Shipping charge fetched successfully",
    );
  } catch (error) {
    console.error("getShippingCharge error:", error);
    res.status(500);
    return sendResponse(
      res,
      false,
      null,
      "Something went wrong while fetching shipping charge",
    );
  }
};

const saveShippingCharge = async (req, res) => {
  try {
    const body = req.body || {};

    const shippingType = ["price", "weight", "quntity"].includes(
      body.shippingType,
    )
      ? body.shippingType
      : "price";

    const codRules = Array.isArray(body?.productRules?.cod)
      ? body.productRules.cod.map(sanitizeRule)
      : [];
    const prepaidRules = Array.isArray(body?.productRules?.prepaid)
      ? body.productRules.prepaid.map(sanitizeRule)
      : [];
    const partialRules = Array.isArray(body?.productRules?.partialCod)
      ? body.productRules.partialCod.map(sanitizeRule)
      : [];

    let settings = await sippingchargeModel.findOne();

    
    const payload = {
      shippingType,
      partialCod: body?.partialCod
        ? {
            codType: ["fixed", "percentage"].includes(body.partialCod.codType)
              ? body.partialCod.codType
              : "fixed",
            value: toNumber(body.partialCod.value),
          }
        : settings?.partialCod || { codType: "fixed", value: 0 },
      productRules: {
        cod: body?.productRules?.cod
          ? codRules
          : settings?.productRules?.cod || [],
        prepaid: body?.productRules?.prepaid
          ? prepaidRules
          : settings?.productRules?.prepaid || [],
        partialCod: body?.productRules?.partialCod
          ? partialRules
          : settings?.productRules?.partialCod || [],
      },
    };

    let errors = [];
    codRules.forEach((r, i) => errors.push(...validateRule(r, "COD", i)));
    prepaidRules.forEach((r, i) =>
      errors.push(...validateRule(r, "Prepaid", i)),
    );
    partialRules.forEach((r, i) =>
      errors.push(...validateRule(r, "Partial COD", i)),
    );

    if (
      payload.partialCod.value === undefined ||
      payload.partialCod.value === null ||
      isNaN(payload.partialCod.value)
    ) {
      errors.push("Partial COD value is required");
    }

    if (errors.length > 0) {
      res.status(400);
      return sendResponse(res, false, { errors }, "Validation failed");
    }

    if (settings) {
      settings.set(payload);
      await settings.save();
    } else {
      settings = await sippingchargeModel.create(payload);
    }

    return sendResponse(
      res,
      true,
      settings,
      "Shipping charge saved successfully",
    );
  } catch (error) {
    console.error("saveShippingCharge error:", error);
    res.status(500);
    return sendResponse(
      res,
      false,
      null,
      "Something went wrong while saving shipping charge",
    );
  }
};

module.exports = { getShippingCharge, saveShippingCharge };

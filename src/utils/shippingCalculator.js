function findMatchingRule(rules = [], productId, subCategoryId) {
  const pid = String(productId || "");
  const subId = String(subCategoryId || "");

  const specificProductRule = rules.find(
    (r) =>
      r.applyTo === "specificproducts" &&
      (r.products || []).some((p) => String(p) === pid),
  );
  if (specificProductRule) return specificProductRule;

  const specificSubCatRule = rules.find(
    (r) =>
      r.applyTo === "specificsubcategory" &&
      (r.subCategories || []).some((s) => String(s) === subId),
  );
  if (specificSubCatRule) return specificSubCatRule;

  const excludeRule = rules.find(
    (r) =>
      r.applyTo === "Excludeproduct" &&
      !(r.products || []).some((p) => String(p) === pid),
  );
  if (excludeRule) return excludeRule;

  const allProductsRule = rules.find((r) => r.applyTo === "allproducts");
  if (allProductsRule) return allProductsRule;

  return null;
}

function chargeFromRange(range, groupAmount) {
  if (!range) return 0;
  switch (range.chargeType) {
    case "free_shipping":
      return 0;
    case "percentage":
      return Math.round((groupAmount * Number(range.charge)) / 100);
    default:
      return Number(range.charge || 0);
  }
}

function normalizeRuleShippingType(rule, fallback) {
  const raw = String(rule?.shippingType || fallback || "price")
    .toLowerCase()
    .trim();
  if (raw.includes("weight")) return "weight";
  if (
    raw.includes("quantity") ||
    raw.includes("quntity") ||
    raw.includes("qty")
  )
    return "quantity";
  return "price";
}

function chargeForGroup(rule, groupData, fallbackType) {
  if (!rule) return 0;

  const type = normalizeRuleShippingType(rule, fallbackType);
  const compareValue =
    type === "weight"
      ? groupData.weight
      : type === "quantity"
        ? groupData.qty
        : groupData.amount;

  if (
    Number(rule.freeThreshold) > 0 &&
    compareValue >= Number(rule.freeThreshold)
  ) {
    return 0;
  }

  const matchedRange = (rule.ranges || []).find(
    (range) =>
      compareValue >= Number(range.from) && compareValue <= Number(range.to),
  );

  return chargeFromRange(matchedRange, groupData.amount);
}
export function calculateShipping(items = [], paymentKey, settings) {
  if (!settings || !items.length) return 0;

  const globalShippingType = settings.shippingType || "price";
  const rules = settings.productRules?.[paymentKey] || [];
  if (!rules.length) return 0;

  const groups = new Map();

  items.forEach((item) => {
    const rule = findMatchingRule(rules, item.productId, item.subCategoryId);
    if (!rule) return;

    const qty = Number(item.quantity || 1);
    const lineAmount = Number(item.price || 0) * qty;
    const lineWeight = Number(item.weight || 0) * qty;

    if (!groups.has(rule))
      groups.set(rule, { rule, amount: 0, weight: 0, qty: 0 });
    const g = groups.get(rule);
    g.amount += lineAmount;
    g.weight += lineWeight;
    g.qty += qty;
  });

  let totalShipping = 0;
  groups.forEach((g) => {
    totalShipping += chargeForGroup(g.rule, g, globalShippingType);
  });

  return totalShipping;
}

export function calculatePartialCodAdvance(totalAmount, settings) {
  if (!settings?.partialCod) return 0;
  const { codType, value } = settings.partialCod;
  if (codType === "percentage") {
    return Math.round((totalAmount * Number(value)) / 100);
  }
  return Number(value || 0);
}

export function getShippingPaymentKey(selectedPayment) {
  if (selectedPayment === "partial_cod") return "partialCod";
  if (selectedPayment === "cod") return "cod";
  if (selectedPayment === "wallet") return "wallet";
  return "prepaid";
}

export function getDisabledPaymentTypes(items = [], settings) {
  const result = {
    cod: { disabled: false, products: [] },
    partial_cod: { disabled: false, products: [] },
    prepaid: { disabled: false, products: [] },
    wallet: { disabled: false, products: [] },
  };

  if (!settings?.productRules || !items.length) return result;

  const allRules = [
    ...(settings.productRules.cod || []),
    ...(settings.productRules.prepaid || []),
    ...(settings.productRules.partialCod || []),
    ...(settings.productRules.wallet || []),
  ];

  items.forEach((item) => {
    const rule = findMatchingRule(allRules, item.productId, item.subCategoryId);
    if (!rule || !rule.paymentType) return;

    const pType = String(rule.paymentType).toLowerCase().trim();
    if (pType === "all" || pType === "") return;

    const key =
      pType === "partial" ||
      pType === "partial cod" ||
      pType === "partial_cod" ||
      pType === "partialcod"
        ? "partial_cod"
        : pType === "cod"
          ? "cod"
          : pType === "prepaid"
            ? "prepaid"
            : pType === "wallet"
              ? "wallet"
              : null;

    if (!key) return;

    result[key].disabled = true;
    if (item.name && !result[key].products.includes(item.name)) {
      result[key].products.push(item.name);
    }
  });

  return result;
}

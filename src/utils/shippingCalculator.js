/**
 * Calculate shipping charge based on system settings
 * @param {number} orderAmount - subtotal amount
 * @param {"cod"|"prepaid"} paymentType
 * @param {object} settings - from redux systemseting.data
 * @returns {number} shipping charge
 */
// export function calculateShipping(orderAmount, paymentType, settings) {
//     if (!settings) return 0;

//     const config = paymentType === "cod" ? settings.cod : settings.prepaid;
//     if (!config) return 0;

//     // Free threshold check
//     if (config.freeThreshold > 0 && orderAmount >= config.freeThreshold) {
//         return 0;
//     }

//     // Range match
//     const matched = (config.ranges || []).find(
//         (r) => orderAmount >= r.from && orderAmount < r.to
//     );

//     if (!matched) return 0;

//     if (matched.chargeType === "free_shipping") return 0;
//     if (matched.chargeType === "percentage") {
//         return Math.round((orderAmount * matched.charge) / 100);
//     }
//     return matched.charge; // fixed
// }

export function calculateShipping(orderAmount, paymentType, settings) {
  if (!settings) return 0;

  // payment type મુજબ config
  const config = paymentType === "cod" ? settings.cod : settings.prepaid;

  if (!config) return 0;

  // Free Shipping Check
  if (
    Number(config.freeThreshold) > 0 &&
    orderAmount >= Number(config.freeThreshold)
  ) {
    return 0;
  }

  // Range Match
  const matchedRange = (config.ranges || []).find(
    (range) =>
      orderAmount >= Number(range.from) && orderAmount <= Number(range.to),
  );

  if (!matchedRange) return 0;

  switch (matchedRange.chargeType) {
    case "free_shipping":
      return 0;

    case "percentage":
      return Math.round((orderAmount * Number(matchedRange.charge)) / 100);

    default:
      return Number(matchedRange.charge || 0);
  }
}
/**
 * Calculate partial COD advance amount
 * @param {number} totalAmount
 * @param {object} settings
 * @returns {number} advance amount to pay online
 */
export function calculatePartialCodAdvance(totalAmount, settings) {
  if (!settings?.partialCod) return 0;
  const { codType, value } = settings.partialCod;
  if (codType === "percentage") {
    return Math.round((totalAmount * value) / 100);
  }
  return value; // fixed or range
}

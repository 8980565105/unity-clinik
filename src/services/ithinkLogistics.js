const axios = require("axios");

const BASE_URL = "https://my.ithinklogistics.com/api_v3";
const ACCESS_TOKEN = process.env.ITHINK_ACCESS_TOKEN;
const SECRET_KEY = process.env.ITHINK_SECRET_KEY;

const fmtDateTime = (d) => {
  const dt = d ? new Date(d) : new Date();
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
};

// ═══════════════════════════════════════════════════════
// SYNC ORDER TO ITHINK DASHBOARD (auto on order placed)
// ═══════════════════════════════════════════════════════
const syncOrderToIthink = async ({ order, orderItems }) => {
  console.log("\n========== ITHINK SYNC START ==========");
  console.log("Order Number:", order.order_number);

  if (!ACCESS_TOKEN || !SECRET_KEY) {
    console.log("❌ ITHINK credentials missing in .env");
    throw new Error("iThink credentials missing. Check .env file");
  }

  const addr = order.shippingAddress || {};
  const customerName =
    `${addr.firstName || ""} ${addr.lastName || ""}`.trim() || "Customer";
  const items = orderItems || [];

  const isCOD = order.payment_method === "COD";
  const codAmount = isCOD ? String(order.total_price) : "0";

  // const products = items
  //   .filter((it) => !it.is_gift)
  //   .map((item) => ({
  //     product_name: item.product_id?.name || "Product",
  //     product_sku: item.variant_id?.sku || "",
  //     product_quantity: String(item.quantity || 1),
  //     product_price: String(item.price_at_order ?? 0),
  //     product_tax_rate: "0",
  //     product_hsn_code: "",
  //     product_discount: "0",
  //   }));

  // if (!products.length) {
  //   products.push({
  //     product_name: "Order Item",
  //     product_sku: "",
  //     product_quantity: "1",
  //     product_price: String(order.total_price || 0),
  //     product_tax_rate: "0",
  //     product_hsn_code: "",
  //     product_discount: "0",
  //   });
  // }

  const products = items
    .filter((it) => !it.is_gift)
    .map((item) => ({
      product_name: item.product_id?.name || "Product",
      product_sku: item.variant_id?.sku || "NA",
      product_quantity: String(item.quantity || 1),
      product_price: String(item.price_at_order ?? 0),
      product_tax_rate: "0",

      product_hsn_code: item.product_id?.hsn_code
        ? String(item.product_id.hsn_code)
        : "9999",
      product_discount: "0",
    }));

  if (!products.length) {
    products.push({
      product_name: "Order Item",
      product_sku: "NA",
      product_quantity: "1",
      product_price: String(order.total_price || 0),
      product_tax_rate: "0",
      product_hsn_code: "9999",
      product_discount: "0",
    });
  }

  const shipment = {
    order: order.order_number,
    sub_order: "",
    order_date: fmtDateTime(order.createdAt),
    total_amount: String(order.total_price),
    name: customerName,
    company_name: "",
    add: addr.address || "",
    add2: "",
    add3: "",
    pin: String(addr.pincode || ""),
    city: addr.city || "",
    state: addr.state || "",
    country: "India",
    phone: String(addr.phone || ""),
    alt_phone: String(addr.phone || ""),
    email: order.user_id?.email || order.email || "",
    is_billing_same_as_shipping: "yes",
    billing_name: customerName,
    billing_company_name: "",
    billing_add: addr.address || "",
    billing_add2: "",
    billing_add3: "",
    billing_pin: String(addr.pincode || ""),
    billing_city: addr.city || "",
    billing_state: addr.state || "",
    billing_country: "India",
    billing_phone: String(addr.phone || ""),
    billing_alt_phone: String(addr.phone || ""),
    billing_email: order.user_id?.email || order.email || "",
    products,
    shipment_length: String(order.shipment_length || 0.1),
    shipment_width: String(order.shipment_width || 0.1),
    shipment_height: String(order.shipment_height || 0.1),
    weight: String(order.shipment_weight || 0.1),
    shipping_charges: String(order.shipping_charge || 0),
    giftwrap_charges: "0",
    transaction_charges: "0",
    total_discount: String(order.coupon_discount || 0),
    first_attemp_discount: "0",
    cod_charges: "0",
    advance_amount: String(order.advance_amount || 0),
    cod_amount: codAmount,
    payment_mode: isCOD ? "COD" : "Prepaid",
    reseller_name: "",
    eway_bill_number: "",
    gst_number: "",
  };

  const payload = {
    data: {
      shipments: [shipment],
      access_token: ACCESS_TOKEN,
      secret_key: SECRET_KEY,
    },
  };

  console.log("REQUEST PAYLOAD:");
  console.dir(payload, { depth: null });

  let response;
  try {
    response = await axios.post(`${BASE_URL}/order/sync.json`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });
    console.log("✅ ITHINK SYNC SUCCESS RESPONSE:");
    console.dir(response.data, { depth: null });
  } catch (err) {
    console.log("❌ ITHINK SYNC ERROR");
    console.log("STATUS:", err.response?.status);
    console.dir(err.response?.data, { depth: null });
    console.log("MESSAGE:", err.message);
    console.log("========== ITHINK SYNC END (FAILED) ==========\n");
    throw new Error(
      err.response?.data?.message ||
        err.response?.data?.html_message ||
        err.message ||
        "iThink sync API request failed",
    );
  }

  const data = response.data;
  const result = Object.values(data?.data || {})[0];

  if (!result || (result.status && result.status !== "Success")) {
    const errorMsg =
      result?.remark ||
      data?.html_message ||
      data?.message ||
      (data ? JSON.stringify(data) : "");
    console.log("❌ ITHINK returned failure:", errorMsg);
    console.log("========== ITHINK SYNC END (FAILED) ==========\n");
    throw new Error(errorMsg || "iThink order sync failed");
  }

  console.log("✅ Order successfully pushed to iThink dashboard");
  console.log("========== ITHINK SYNC END ==========\n");

  return { pushed: true, raw: result };
};

// ═══════════════════════════════════════════════════════
// TRACK AWB (unchanged — already correct)
// ═══════════════════════════════════════════════════════
const trackIthinkAWB = async (awb) => {
  console.log("\n---- ITHINK TRACK AWB:", awb, "----");
  const payload = {
    data: {
      awb_number_list: awb,
      access_token: ACCESS_TOKEN,
      secret_key: SECRET_KEY,
    },
  };
  try {
    const { data } = await axios.post(`${BASE_URL}/order/track.json`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });
    console.log("TRACK RESPONSE:", JSON.stringify(data));
    const info = data?.data?.[awb];
    if (!info) throw new Error("Tracking info not found");
    return {
      current_status: info.current_status,
      expected_delivery_date: info.expected_delivery_date || null,
      last_scan_details: info.last_scan_details || null,
      scan_details: info.scan_details || info.tracking_data || [],
    };
  } catch (err) {
    console.log("❌ TRACK ERROR:", err.response?.data || err.message);
    throw err;
  }
};

const mapIthinkStatus = (ithinkStatus = "") => {
  const s = ithinkStatus.toLowerCase();
  if (s.includes("delivered")) return "completed";
  if (s.includes("rto")) return "rto";
  if (s.includes("out for delivery") || s.includes("in transit"))
    return "in_transit";
  if (s.includes("shipped") || s.includes("picked")) return "shipped";
  if (s.includes("cancel")) return "cancelled";
  return null;
};

const checkPincodeServiceability = async (pincode) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/pincode/check.json`,
      {
        data: {
          pincode: String(pincode),
          access_token: ACCESS_TOKEN,
          secret_key: SECRET_KEY,
        },
      },
      { headers: { "Content-Type": "application/json" } },
    );
    const pincodeData = response.data?.data?.[String(pincode)];
    if (!pincodeData) return { serviceable: false };
    const metaKeys = [
      "remark",
      "state_name",
      "city_name",
      "city_id",
      "state_id",
    ];
    const courierEntries = Object.keys(pincodeData)
      .filter((k) => !metaKeys.includes(k))
      .map((k) => pincodeData[k]);
    const isServiceable = courierEntries.some(
      (c) => c?.cod === "Y" || c?.prepaid === "Y",
    );
    return {
      serviceable: isServiceable,
      cod: courierEntries.some((c) => c?.cod === "Y"),
      prepaid: courierEntries.some((c) => c?.prepaid === "Y"),
      district: pincodeData.city_name || "",
      state_code: pincodeData.state_name || "",
      remark: pincodeData.remark || "",
    };
  } catch (err) {
    console.error(
      "iThink pincode check error:",
      err?.response?.data || err.message,
    );
    return { serviceable: false, error: true };
  }
};

module.exports = {
  syncOrderToIthink,
  trackIthinkAWB,
  mapIthinkStatus,
  checkPincodeServiceability,
};

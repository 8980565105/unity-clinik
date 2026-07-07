const axios = require("axios");

const BASE_URL = "https://my.ithinklogistics.com/api_v3/order/add.json";
const ACCESS_TOKEN = process.env.ITHINK_ACCESS_TOKEN;
const SECRET_KEY = process.env.ITHINK_SECRET_KEY;
const PICKUP_ADDRESS_ID = process.env.ITHINK_PICKUP_ADDRESS_ID;
const RETURN_ADDRESS_ID =
  process.env.ITHINK_RETURN_ADDRESS_ID || PICKUP_ADDRESS_ID;
const LOGISTICS_PARTNER = process.env.ITHINK_LOGISTICS_PARTNER || "Delhivery";
const fmtDate = (d) => {
  const dt = d ? new Date(d) : new Date();
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};
const getItemWeight = (item) => {
  const w = Number(item.variant_id?.ProductWeight) || 0;
  return w > 0 ? w : 0.01;
};
const syncOrderToIthink = async ({ order, orderItems }) => {
  if (!ACCESS_TOKEN || !SECRET_KEY || !PICKUP_ADDRESS_ID) {
    throw new Error("iThink credentials missing. Check .env file");
  }
  const addr = order.shippingAddress || {};
  const customerName =
    `${addr.firstName || ""} ${addr.lastName || ""}`.trim() || "Customer";
  const items = orderItems || [];
  const totalWeightKg = items.reduce(
    (sum, item) => sum + getItemWeight(item) * (item.quantity || 1),
    0,
  );
  const maxLength = Math.max(
    ...items.map((i) => Number(i.variant_id?.ProductLength)),
    10,
  );
  const maxWidth = Math.max(
    ...items.map((i) => Number(i.variant_id?.ProductWidth)),
    10,
  );
  const totalHeight = items.reduce(
    (sum, i) =>
      sum + (Number(i.variant_id?.ProductHeight) || 5) * (i.quantity || 1),
    0,
  );
  const isCOD = order.payment_method === "COD";
  const paymentMode = isCOD ? "COD" : "Prepaid";
  const codAmount = isCOD ? String(order.total_price) : "0";
  const products = items.map((item) => ({
    product_name: item.product_id?.name || "Product",
    product_sku: item.variant_id?.sku || item.product_id?.sku || "",
    product_quantity: String(item.quantity || 1),
    product_price: String(item.price_at_order ?? 0),
    product_tax_rate: String(item.product_id?.tax_rate || 0),
    product_hsn_code: item.product_id?.hsn_code || "",
    product_discount: "0",
    product_img_url:
      item.variant_id?.images?.[0] || item.product_id?.images || "",
  }));
  if (!products.length) {
    products.push({
      product_name: "Order Item",
      product_sku: "",
      product_quantity: "1",
      product_price: String(order.total_price || 0),
      product_tax_rate: "0",
      product_hsn_code: "",
      product_discount: "0",
      product_img_url: "",
    });
  }
  const shipment = {
    waybill: "",
    order: order.order_number,
    sub_order: "A",
    order_date: fmtDate(order.createdAt),
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
    email: order.email || order.user_id?.email || "",
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
    billing_email: order.email || order.user_id?.email || "",
    products,
    shipment_length: String(maxLength),
    shipment_width: String(maxWidth),
    shipment_height: String(totalHeight || 5),
    weight: totalWeightKg.toFixed(2),
    shipment_service_type: order.shipment_service_type || "forward",
    shipping_charges: String(order.shipping_charge || 0),
    giftwrap_charges: "0",
    transaction_charges: "0",
    total_discount: String(order.coupon_discount || 0),
    first_attemp_discount: "0",
    cod_charges: "0",
    advance_amount: "0",
    cod_amount: codAmount,
    payment_mode: paymentMode,
    reseller_name: "",
    eway_bill_number: "",
    gst_number: "",
    what3words: "",
    return_address_id: String(RETURN_ADDRESS_ID),
    api_source: "0",
    store_id: process.env.ITHINK_STORE_ID || "1",
  };
  const payload = {
    data: {
      shipments: [shipment],
      pickup_address_id: String(PICKUP_ADDRESS_ID),
      access_token: ACCESS_TOKEN,
      secret_key: SECRET_KEY,
      logistics: LOGISTICS_PARTNER,
      s_type: "",
      order_type: "",
    },
  };
  const response = await axios.post(`${BASE_URL}/order/add.json`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });
  const data = response.data;
  const result = data?.data?.["1"];
  if (!result || result.status !== "Success") {
    throw new Error(
      result?.remark || data?.html_message || "iThink order creation failed",
    );
  }
  return { pushed: true };
};

// ═══════════════════════════════════════════════════════════════
// 2. TRACK AWB
// ═══════════════════════════════════════════════════════════════
const trackIthinkAWB = async (awb) => {
  const payload = {
    data: {
      awb_number_list: awb,
      access_token: ACCESS_TOKEN,
      secret_key: SECRET_KEY,
    },
  };

  const { data } = await axios.post(`${BASE_URL}/order/track.json`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });

  const info = data?.data?.[awb];
  if (!info) throw new Error("Tracking info not found");

  return {
    current_status: info.current_status,
    expected_delivery_date: info.expected_delivery_date || null,
    last_scan_details: info.last_scan_details || null,
    scan_details: info.scan_details || info.tracking_data || [],
  };
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

const verifyIthinkSignature = (rawBody, signature) => {
  if (!signature) return false;
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", SECRET_KEY || "")
    .update(rawBody)
    .digest("hex");
  return expected === signature;
};

module.exports = {
  syncOrderToIthink,
  trackIthinkAWB,
  mapIthinkStatus,
  verifyIthinkSignature,
};

const axios = require("axios");
const crypto = require("crypto");

const ITHINK_BASE = "https://my.ithinklogistics.com/api_v3";
const ACCESS_TOKEN = process.env.ITHINK_API_KEY;
const SECRET_KEY = process.env.ITHINK_SECRET;
const WEBHOOK_SECRET = process.env.ITHINK_WEBHOOK_SECRET;

// ── Status map ─────────────────────────────────────────────────────────
const mapIthinkStatus = (s) => {
  const map = {
    Manifested: "shipped",
    "Picked Up": "shipped",
    "Pickup Pending": "shipped",
    "In Transit": "in_transit",
    "Reached At Destination": "in_transit",
    "Out For Delivery": "in_transit",
    Undelivered: "in_transit",
    Delayed: "in_transit",
    Delivered: "completed",
    "RTO Pending": "rto",
    "RTO Processing": "rto",
    "RTO In Transit": "rto",
    "RTO Delivered": "rto",
    Cancelled: "cancelled",
    Lost: "rto",
  };
  return map[s] || null;
};

// ── Step 1: Sync order → ithink ─────────────────────────────────────────
const syncOrderToIthink = async ({ order, orderItems }) => {
  const addr = order.shippingAddress;

  const orderDate = new Date(order.createdAt);
  const dd = String(orderDate.getDate()).padStart(2, "0");
  const mm = String(orderDate.getMonth() + 1).padStart(2, "0");
  const yyyy = orderDate.getFullYear();
  const formattedDate = `${dd}-${mm}-${yyyy} 00:01:00`;

  const payload = {
    data: {
      access_token: ACCESS_TOKEN,
      secret_key: SECRET_KEY,
      shipments: [
        {
          order: order.order_number,
          sub_order: "",
          order_date: formattedDate,
          total_amount: String(order.total_price),
          name: `${addr.firstName} ${addr.lastName}`.trim(),
          company_name: "",
          add: addr.address,
          add2: "",
          add3: "",
          pin: addr.pincode,
          city: addr.city,
          state: addr.state,
          country: "India",
          phone: addr.phone,
          alt_phone: addr.phone,
          email: order.user_id?.email || "",
          is_billing_same_as_shipping: "yes",
          billing_name: `${addr.firstName} ${addr.lastName}`.trim(),
          billing_company_name: "",
          billing_add: addr.address,
          billing_add2: "",
          billing_add3: "",
          billing_pin: addr.pincode,
          billing_city: addr.city,
          billing_state: addr.state,
          billing_country: "India",
          billing_phone: addr.phone,
          billing_alt_phone: addr.phone,
          billing_email: order.user_id?.email || "",
          products: orderItems.map((item) => ({
            product_name: item.product_id?.name || "Product",
            product_sku: item.variant_id?.sku || "SKU",
            product_quantity: String(item.quantity),
            product_price: String(item.price_at_order),
            product_tax_rate: "0",
            product_hsn_code: "",
            product_discount: "0",
          })),
          shipment_length: "10",
          shipment_width: "10",
          shipment_height: "10",
          weight: "0.5",
          shipping_charges: "0",
          giftwrap_charges: "0",
          transaction_charges: "0",
          total_discount: "0",
          first_attemp_discount: "0",
          cod_charges: "0",
          advance_amount: "0",
          cod_amount:
            order.payment_method === "COD" ? String(order.total_price) : "0",
          payment_mode: order.payment_method === "COD" ? "COD" : "Prepaid",
          reseller_name: "",
          eway_bill_number: "",
          gst_number: "",
        },
      ],
    },
  };

  const syncRes = await axios.post(`${ITHINK_BASE}/order/sync.json`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log("[ithink sync response]", JSON.stringify(syncRes.data));

  const result = syncRes.data?.data?.["1"];
  if (!result || result.status !== "Success") {
    throw new Error(result?.remark || "ithink order sync failed");
  }

  // Step 2: Get AWB
  const awbRes = await axios.post(
    `${ITHINK_BASE}/order/getawb.json`,
    {
      data: {
        access_token: ACCESS_TOKEN,
        secret_key: SECRET_KEY,
        order_number: order.order_number,
      },
    },
    { headers: { "Content-Type": "application/json" } },
  );

  console.log("[ithink awb response]", JSON.stringify(awbRes.data));

  const awb =
    awbRes.data?.data?.awb_number || awbRes.data?.data?.[0]?.awb_number;

  if (!awb) {
    throw new Error("AWB not received from ithink. Check ithink dashboard.");
  }

  return {
    awb_number: String(awb),
    tracking_url: `https://my.ithinklogistics.com/tracking/${awb}`,
    label_url: null,
  };
};

// ── Track AWB ───────────────────────────────────────────────────────────
const trackIthinkAWB = async (awb_number) => {
  const res = await axios.post(
    `${ITHINK_BASE}/order/track.json`,
    {
      data: {
        awb_number_list: String(awb_number),
        access_token: ACCESS_TOKEN,
        secret_key: SECRET_KEY,
      },
    },
    { headers: { "Content-Type": "application/json" } },
  );

  console.log("[ithink track response]", JSON.stringify(res.data));

  const data = res.data?.data?.[String(awb_number)];
  if (!data) throw new Error("AWB not found in ithink tracking response");
  return data;
};

// ── Verify webhook signature ────────────────────────────────────────────
const verifyIthinkSignature = (rawBody, receivedSig) => {
  if (!WEBHOOK_SECRET) return true;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody))
    .digest("hex");
  return expected === receivedSig;
};

module.exports = {
  syncOrderToIthink,
  trackIthinkAWB,
  mapIthinkStatus,
  verifyIthinkSignature,
};

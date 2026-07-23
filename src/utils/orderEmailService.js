const nodemailer = require("nodemailer");
const escapeHtml = require("escape-html");

const e = (val) => (val != null ? escapeHtml(String(val)) : "—");

let _transporter = null;
const getTransporter = () => {
  if (_transporter) return _transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  _transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST || "smtp.gmail.com",
    // port: parseInt(process.env.SMTP_PORT) || 587,
    // secure: false,
    // auth: { user, pass },
    // tls: { rejectUnauthorized: false },
    host: process.env.SMTP_HOST || "smtp.zoho.in",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  // _transporter.verify((err) => {
  //   if (err) console.error("[Email] ❌ SMTP connection failed:", err.message);
  //   else console.log("[Email] ✅ SMTP connected — ready to send emails");
  // });
  _transporter.verify((err, success) => {
    if (err) {
      console.log("SMTP VERIFY ERROR");
      console.log(err);
    } else {
      console.log("SMTP VERIFIED");

      console.log(success);
    }
  });

  return _transporter;
};

const FROM = () =>
  `"${process.env.SMTP_FROM_NAME || "unity clinic"}" <${process.env.SMTP_USER}>`;
const STORE = () => process.env.STORE_NAME || "unity clinic";
const STORE_URL = () => process.env.STORE_URL || "#";

// const send = async (to, subject, html) => {
//   if (!to) {
//     return;
//   }
//   const transport = getTransporter();
//   if (!transport) return;
//   try {

//     await transport.sendMail({
//       from: FROM(),
//       to: to || process.env.ADMIN_EMAIL,
//       cc: process.env.CC_EMAIL,
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.error("[Email] ❌ Send failed:", err.message);
//   }
// };

const send = async (to, subject, html) => {
  const transport = getTransporter();

  if (!transport) {
    console.log("[EMAIL] Transport not created");
    return;
  }

  if (!to) {
    console.log("[EMAIL] Recipient missing");
    return;
  }

  try {
    const info = await transport.sendMail({
      from: FROM(),
      to: process.env.ADMIN_EMAIL,
      cc: process.env.CC_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.log(err);
    console.log("Response:", err.response);
  }
};

const rupee = (n) => `&#8377;${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const safeUrl = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return escapeHtml(url);
    }
  } catch (_) {}
  return "";
};

// ═════════════════════════════════════════════════════════════════════════════
// SHARED ORDER INFO BOX — Name, Mobile, Order ID, Product Details & Qty,
// Delivery Address, Order Amount, Payment Method
// ═════════════════════════════════════════════════════════════════════════════
const PAYMENT_LABELS = {
  COD: "Cash on Delivery (COD)",
  partial_cod: "Partial COD",
  Online: "Online Payment (Razorpay)",
  Razorpay: "Online Payment (Razorpay)",
  Wallet: "Wallet",
  PhonePe: "PhonePe",
};
const paymentMethodLabel = (method) => PAYMENT_LABELS[method] || method || "—";

const buildOrderInfoBox = (order, items = []) => {
  const addr = order.shippingAddress || {};
  const customerName =
    order.user_id?.name ||
    `${addr.firstName || ""} ${addr.lastName || ""}`.trim() ||
    "Customer";
  const mobile = addr.phone || "—";
  const addressLine = [addr.address, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(", ");
  const paymentLabel = paymentMethodLabel(order.payment_method);

  const itemsHtml = items.length
    ? items
        .map(
          (it) => `
        <div class="row">
          <span class="lbl">${e(it.name)}${it.sku ? ` <span style="color:#aaa;font-weight:400">(${e(it.sku)})</span>` : ""}</span>
          <span class="val">Qty: ${e(it.quantity)}${it.price != null ? ` &nbsp;•&nbsp; ${rupee(it.price)} each` : ""}</span>
        </div>`,
        )
        .join("")
    : `<div class="row"><span class="lbl">Items</span><span class="val">—</span></div>`;

  return `
    <div class="box">
      <div class="row"><span class="lbl">Name</span><span class="val">${e(customerName)}</span></div>
      <div class="row"><span class="lbl">Mobile Number</span><span class="val">${e(mobile)}</span></div>
      <div class="row"><span class="lbl">Order ID</span><span class="val">${e(order.order_number)}</span></div>
    </div>
    <div class="tbox">
      <p style="font-weight:700;color:#1e3a5f;margin-bottom:10px;font-size:14px;">🛍️ Product Details</p>
      ${itemsHtml}
    </div>
    <div class="box">
      <div class="row"><span class="lbl">Delivery Address</span><span class="val">${e(addressLine) || "—"}</span></div>
      <div class="row"><span class="lbl">Order Amount</span><span class="val">${rupee(order.total_price)}</span></div>
      <div class="row"><span class="lbl">Payment Method</span><span class="val">${e(paymentLabel)}</span></div>
    </div>
  `;
};

const base = (body, preview = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f0f2f5;font-family:Arial,sans-serif;color:#333;padding:20px}
  .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.10)}
  .hdr{background:#1e3a5f;padding:22px 32px;text-align:center}
  .hdr h1{color:#fff;font-size:22px;letter-spacing:.5px}
  .hdr p{color:#a8c4e0;font-size:13px;margin-top:4px}
  .bdy{padding:28px 32px}
  .bdy h2{color:#1e3a5f;font-size:18px;margin-bottom:8px}
  .bdy p{font-size:14px;color:#555;line-height:1.6;margin:8px 0}
  .badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;margin:10px 0}
  .box{background:#f7f9fc;border:1px solid #e2e6ea;border-radius:8px;padding:14px 18px;margin:14px 0}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:14px}
  .row:last-child{border-bottom:none}
  .lbl{color:#777}
  .val{font-weight:600;color:#111;text-align:right;max-width:58%}
  .tbox{background:#e8f4fd;border:1px solid #b3d7f0;border-radius:8px;padding:14px 18px;margin:14px 0}
  .btn{display:block;width:fit-content;margin:18px auto;padding:12px 30px;background:#1e3a5f;color:#fff !important;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;text-align:center}
  .ftr{background:#f7f9fc;padding:16px 32px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee}
  .ftr a{color:#1e3a5f;text-decoration:none}
  @media(max-width:480px){.bdy,.hdr,.ftr{padding:18px 16px}.row{flex-direction:column}.val{text-align:left;max-width:100%}}
</style>
</head>
<body>
${preview ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px">${e(preview)}</div>` : ""}
<div class="wrap">
  <div class="hdr"><h1>${e(STORE())}</h1><p>Order Notification</p></div>
  <div class="bdy">${body}</div>
  <div class="ftr">&copy; ${new Date().getFullYear()} ${e(STORE())} &nbsp;|&nbsp; <a href="${safeUrl(STORE_URL())}">${e(STORE_URL())}</a><br/>This is an automated email. Please do not reply.</div>
</div>
</body>
</html>`;

// ═════════════════════════════════════════════════════════════════════════════
// 1. ORDER PLACED
// ═════════════════════════════════════════════════════════════════════════════
const sendOrderPlaced = async (order, userEmail, userName, items = []) => {
  const subject = `Order Placed — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Thank you for your order! 🎉</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, we've received your order and it's being reviewed.</p>
    <span class="badge" style="background:#fef3c7;color:#92400e;">🕐 Order Placed</span>
    ${buildOrderInfoBox(order, items)}
    <p>We'll notify you as your order moves forward. 🚀</p>
  `,
      `Order ${order.order_number} placed!`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2. ORDER CONFIRMED
// ═════════════════════════════════════════════════════════════════════════════
const sendOrderConfirmed = async (order, userEmail, userName, items = []) => {
  const subject = `Order Confirmed — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Your order has been confirmed! ✅</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, our team has confirmed your order and is preparing it for packing.</p>
    <span class="badge" style="background:#dcfce7;color:#166534;">✅ Confirmed</span>
    ${buildOrderInfoBox(order, items)}
    ${order.admin_note ? `<p><strong>Note:</strong> ${e(order.admin_note)}</p>` : ""}
    <p>Next step: We'll pack your items and get them ready to ship. 📦</p>
  `,
      `Order ${order.order_number} confirmed!`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. ORDER PACKED
// ═════════════════════════════════════════════════════════════════════════════
const sendOrderPacked = async (order, userEmail, userName, items = []) => {
  const subject = `Order Packed — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Your order is packed! 📦</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, your order has been securely packed and is ready for courier pickup.</p>
    <span class="badge" style="background:#e0f2fe;color:#075985;">📦 Packed</span>
    ${buildOrderInfoBox(order, items)}
    <p>We're assigning a courier partner. Shipment notification coming soon! 🚚</p>
  `,
      `Order ${order.order_number} is packed.`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 4. COURIER ASSIGNED / READY TO SHIP
// ═════════════════════════════════════════════════════════════════════════════
const sendCourierAssigned = async (order, userEmail, userName, items = []) => {
  const courier = order.courier || {};
  const awb = courier.awb_number || "—";
  const partner = courier.partner || courier.name || "Courier";
  const trackingUrl = safeUrl(courier.tracking_url || "");
  const pickupDate = courier.pickup_date
    ? fmtDate(courier.pickup_date)
    : "Soon";

  const subject = `Shipment Scheduled — AWB: ${awb} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Your order is ready to ship! 🚚</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, your order has been assigned to a courier and will be picked up shortly.</p>
    <span class="badge" style="background:#f3e8ff;color:#6b21a8;">🚚 Ready to Ship</span>
    <div class="tbox">
      <p style="font-weight:700;color:#1e3a5f;margin-bottom:10px;font-size:15px;">📋 Shipment Details</p>
      <div class="row"><span class="lbl">Courier Partner</span><span class="val">${e(partner)}</span></div>
      <div class="row"><span class="lbl">AWB / Tracking No</span><span class="val" style="font-size:16px;color:#1e3a5f;">${e(awb)}</span></div>
      <div class="row"><span class="lbl">Pickup Date</span><span class="val">${e(pickupDate)}</span></div>
    </div>
    ${buildOrderInfoBox(order, items)}
    ${
      trackingUrl
        ? `<a href="${trackingUrl}" class="btn" target="_blank" rel="noopener noreferrer">🔍 Track Your Shipment</a>
         <p style="text-align:center;font-size:12px;color:#888">Or copy: <a href="${trackingUrl}" style="color:#1e3a5f">${trackingUrl}</a></p>`
        : `<p>Tracking link will be shared once the shipment is dispatched.</p>`
    }
    <p style="margin-top:16px">If you have questions, please contact our support.</p>
  `,
      `AWB ${awb} — Your order is ready to ship!`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 5. ORDER SHIPPED / DISPATCHED
// ═════════════════════════════════════════════════════════════════════════════
const sendOrderShipped = async (order, userEmail, userName, items = []) => {
  const courier = order.courier || {};
  const awb = courier.awb_number || "—";
  const partner = courier.partner || courier.name || "Courier";
  const trackingUrl = safeUrl(courier.tracking_url || "");

  const subject = `Order Dispatched! — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Your order has been dispatched! 🎉</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, your package has left our warehouse and is on its way!</p>
    <span class="badge" style="background:#dbeafe;color:#1e40af;">✈️ Shipped</span>
    <div class="tbox">
      <p style="font-weight:700;color:#1e3a5f;margin-bottom:10px;font-size:15px;">📦 Tracking Information</p>
      <div class="row"><span class="lbl">Courier</span><span class="val">${e(partner)}</span></div>
      <div class="row"><span class="lbl">Tracking No</span><span class="val" style="font-size:16px;color:#1e3a5f;font-weight:700">${e(awb)}</span></div>
      <div class="row"><span class="lbl">Dispatched On</span><span class="val">${e(fmtDate(courier.dispatched_at || new Date()))}</span></div>
    </div>
    ${
      trackingUrl
        ? `<a href="${trackingUrl}" class="btn" target="_blank" rel="noopener noreferrer">🔍 Track Your Package</a>
         <p style="text-align:center;font-size:12px;color:#888">Tracking: <a href="${trackingUrl}" style="color:#1e3a5f">${trackingUrl}</a></p>`
        : ""
    }
    ${buildOrderInfoBox(order, items)}
    <p>Delivery usually takes 3–7 business days.</p>
  `,
      `Your order is on the way! Tracking: ${awb}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 6. TRACKING UPDATED
// ═════════════════════════════════════════════════════════════════════════════
const sendTrackingUpdated = async (
  order,
  userEmail,
  userName,
  note = "",
  items = [],
) => {
  const courier = order.courier || {};
  const awb = courier.awb_number || "—";
  const trackingUrl = safeUrl(courier.tracking_url || "");

  const subject = `Tracking Update — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Shipment Update 📍</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, here's the latest update on your order.</p>
    <span class="badge" style="background:#fef9c3;color:#713f12;">📍 In Transit</span>
    ${note ? `<div class="tbox"><div class="row"><span class="lbl">Update</span><span class="val">${e(note)}</span></div></div>` : ""}
    ${buildOrderInfoBox(order, items)}
    ${trackingUrl ? `<a href="${trackingUrl}" class="btn" target="_blank" rel="noopener noreferrer">🔍 Track Now</a>` : ""}
  `,
      `Tracking update for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 7. ORDER DELIVERED
// ═════════════════════════════════════════════════════════════════════════════
const sendOrderDelivered = async (order, userEmail, userName, items = []) => {
  const subject = `Order Delivered! — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Your order has been delivered! 🎉</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, your order has been successfully delivered. We hope you love your purchase!</p>
    <span class="badge" style="background:#dcfce7;color:#14532d;">✅ Delivered</span>
    ${buildOrderInfoBox(order, items)}
    <p>Delivered on: ${e(fmtDate(order.courier?.delivered_at || new Date()))}</p>
    <p>Thank you for shopping with us! 💛</p>
  `,
      `Order ${order.order_number} delivered!`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 8. ORDER CANCELLED
// ═════════════════════════════════════════════════════════════════════════════
const sendOrderCancelled = async (order, userEmail, userName, items = []) => {
  const subject = `Order Cancelled — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Your order has been cancelled</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, unfortunately your order has been cancelled.</p>
    <span class="badge" style="background:#fee2e2;color:#7f1d1d;">❌ Cancelled</span>
    ${buildOrderInfoBox(order, items)}
    ${order.cancel_reason ? `<p><strong>Reason:</strong> ${e(order.cancel_reason)}</p>` : ""}
    ${order.payment_status === "refunded" ? `<p style="color:#166534;font-weight:600">✅ ${rupee(order.total_price)} has been refunded to your wallet.</p>` : `<p>If you paid online, a refund will be processed within 5–7 business days.</p>`}
  `,
      `Order ${order.order_number} cancelled.`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 9. RTO / RETURNED / REFUNDED (status-change driven, e.g. markRTO)
// ═════════════════════════════════════════════════════════════════════════════
const RTO_TYPE_MAP = {
  rto: {
    label: "Return to Origin",
    badge: "🔄 RTO",
    bg: "#fde8d8",
    color: "#7c2d12",
  },
  returned: {
    label: "Order Returned",
    badge: "↩️ Returned",
    bg: "#fef3c7",
    color: "#78350f",
  },
  refunded: {
    label: "Refund Processed",
    badge: "💰 Refunded",
    bg: "#dcfce7",
    color: "#14532d",
  },
};
const sendOrderRTO = async (
  order,
  userEmail,
  userName,
  type = "rto",
  reason = "",
  items = [],
) => {
  const info = RTO_TYPE_MAP[type] || RTO_TYPE_MAP.rto;
  const subject = `${info.label} — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>${e(info.label)}</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, your order status has been updated.</p>
    <span class="badge" style="background:${info.bg};color:${info.color};">${info.badge}</span>
    ${buildOrderInfoBox(order, items)}
    ${reason ? `<p><strong>Reason:</strong> ${e(reason)}</p>` : ""}
    ${type === "refunded" ? `<p style="color:#166534;font-weight:600">✅ Refund will be credited within 5–7 business days.</p>` : ""}
    <p>For any queries, please contact our support team.</p>
  `,
      `${info.label} for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 10. RETURN REQUESTED (by customer)
// ═════════════════════════════════════════════════════════════════════════════
const sendReturnRequested = async (
  order,
  userEmail,
  userName,
  reason = "",
  items = [],
) => {
  const subject = `Return Request Received — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Return Request Received 📝</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, we've received your return request and our team will review it shortly.</p>
    <span class="badge" style="background:#fef9c3;color:#713f12;">⏳ Pending Review</span>
    ${buildOrderInfoBox(order, items)}
    ${reason ? `<p><strong>Reason:</strong> ${e(reason)}</p>` : ""}
    <p>We'll notify you once your return request is approved or rejected.</p>
  `,
      `Return request received for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 11. RETURN DECISION — approved / rejected (by admin)
// ═════════════════════════════════════════════════════════════════════════════
const RETURN_DECISION_MAP = {
  approved: {
    label: "Return Approved",
    badge: "✅ Return Approved",
    bg: "#dcfce7",
    color: "#166534",
  },
  rejected: {
    label: "Return Rejected",
    badge: "❌ Return Rejected",
    bg: "#fee2e2",
    color: "#7f1d1d",
  },
};
const sendReturnDecision = async (
  order,
  userEmail,
  userName,
  decision = "approved",
  note = "",
  items = [],
) => {
  const info = RETURN_DECISION_MAP[decision] || RETURN_DECISION_MAP.approved;
  const subject = `${info.label} — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>${e(info.label)}</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, here's an update on your return request.</p>
    <span class="badge" style="background:${info.bg};color:${info.color};">${info.badge}</span>
    ${buildOrderInfoBox(order, items)}
    ${note ? `<p><strong>Note:</strong> ${e(note)}</p>` : ""}
    ${decision === "approved" ? `<p>Your product will be picked up shortly. Once received, your refund will be processed to your wallet.</p>` : `<p>If you have questions about this decision, please contact our support team.</p>`}
  `,
      `${info.label} for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 12. REFUND PROCESSED (manual, by admin)
// ═════════════════════════════════════════════════════════════════════════════
const sendRefundProcessed = async (
  order,
  userEmail,
  userName,
  amount,
  note = "",
  items = [],
) => {
  const subject = `Refund Processed — ${order.order_number} | ${STORE()}`;
  await send(
    userEmail,
    subject,
    base(
      `
    <h2>Refund Processed 💰</h2>
    <p>Hi <strong>${e(userName) || "Customer"}</strong>, your refund has been processed to your wallet.</p>
    <span class="badge" style="background:#dcfce7;color:#14532d;">💰 Refunded</span>
    <div class="tbox">
      <div class="row"><span class="lbl">Refund Amount</span><span class="val" style="color:#166534;font-size:16px">${rupee(amount)}</span></div>
    </div>
    ${buildOrderInfoBox(order, items)}
    ${note ? `<p><strong>Note:</strong> ${e(note)}</p>` : ""}
    <p>The amount is now available in your wallet balance.</p>
  `,
      `${rupee(amount).replace(/&#8377;/, "₹")} refunded for order ${order.order_number}`,
    ),
  );
};

const ADMIN = () => {
  return process.env.ADMIN_EMAIL || null;
};

const adminBase = (body, preview = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f0f2f5;font-family:Arial,sans-serif;color:#333;padding:20px}
  .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.10)}
  .hdr{background:#1e3a5f;padding:16px 32px;display:flex;justify-content:space-between;align-items:center}
  .hdr h1{color:#fff;font-size:18px}
  .hdr .tag{background:#e2b714;color:#1e3a5f;font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px}
  .bdy{padding:22px 32px}
  .bdy h2{color:#1e3a5f;font-size:16px;margin-bottom:8px}
  .bdy p{font-size:13px;color:#555;line-height:1.6;margin:6px 0}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin:8px 0}
  .box{background:#f7f9fc;border:1px solid #e2e6ea;border-radius:8px;padding:12px 16px;margin:12px 0}
  .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee;font-size:13px}
  .row:last-child{border-bottom:none}
  .lbl{color:#777}
  .val{font-weight:600;color:#111;text-align:right;max-width:60%}
  .tbox{background:#e8f4fd;border:1px solid #b3d7f0;border-radius:8px;padding:12px 16px;margin:12px 0}
  .ftr{background:#f7f9fc;padding:12px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  @media(max-width:480px){.bdy,.hdr,.ftr{padding:16px 14px}.row{flex-direction:column}.val{text-align:left;max-width:100%}}
</style>
</head>
<body>
${preview ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px">${e(preview)}</div>` : ""}
<div class="wrap">
  <div class="hdr"><h1>🔔 ${e(STORE())} Admin</h1><span class="tag">ADMIN ALERT</span></div>
  <div class="bdy">${body}</div>
  <div class="ftr">${e(STORE())} Admin Panel &nbsp;|&nbsp; This is an automated admin notification.</div>
</div>
</body>
</html>`;

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN new order
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminNewOrder = async (
  order,
  customerName,
  customerEmail,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `🛒 New Order — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>New Order Received 🛒</h2>
    <span class="badge" style="background:#fef3c7;color:#92400e;">🕐 Pending</span>
    ${buildOrderInfoBox(order, items)}
    <div class="box"><div class="row"><span class="lbl">Customer Email</span><span class="val">${e(customerEmail)}</span></div></div>
    <p>Login to the admin panel to confirm or manage this order.</p>
  `,
      `New order ${order.order_number} from ${customerName}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN order confirmed
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminOrderConfirmed = async (
  order,
  customerName,
  customerEmail,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `✅ Order Confirmed — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Order Confirmed ✅</h2>
    <span class="badge" style="background:#dcfce7;color:#166534;">✅ Processing</span>
    ${buildOrderInfoBox(order, items)}
    ${order.admin_note ? `<div class="box"><div class="row"><span class="lbl">Admin Note</span><span class="val">${e(order.admin_note)}</span></div></div>` : ""}
    <p>Packing record has been created. Next step: Pack the order.</p>
  `,
      `Order ${order.order_number} confirmed`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN order packed
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminOrderPacked = async (
  order,
  customerName,
  warehouseName,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `📦 Order Packed — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Order Packed 📦</h2>
    <span class="badge" style="background:#e0f2fe;color:#075985;">📦 Packed</span>
    ${buildOrderInfoBox(order, items)}
    <div class="box"><div class="row"><span class="lbl">Warehouse</span><span class="val">${e(warehouseName) || "Default"}</span></div></div>
    <p>Next step: Assign courier and AWB number.</p>
  `,
      `Order ${order.order_number} packed`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN courier assigned
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminCourierAssigned = async (
  order,
  customerName,
  customerEmail,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const courier = order.courier || {};
  const subject = `🚚 Courier Assigned — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Courier Assigned 🚚</h2>
    <span class="badge" style="background:#f3e8ff;color:#6b21a8;">🚚 Ready to Ship</span>
    <div class="tbox">
      <div class="row"><span class="lbl">Courier Partner</span><span class="val">${e(courier.partner || courier.name)}</span></div>
      <div class="row"><span class="lbl">AWB Number</span><span class="val">${e(courier.awb_number)}</span></div>
      <div class="row"><span class="lbl">Pickup Date</span><span class="val">${e(fmtDate(courier.pickup_date))}</span></div>
    </div>
    ${buildOrderInfoBox(order, items)}
    <p>Next step: Ship the order once courier picks it up.</p>
  `,
      `Courier assigned for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN order shipped
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminOrderShipped = async (
  order,
  customerName,
  customerEmail,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const courier = order.courier || {};
  const trackingUrl = safeUrl(courier.tracking_url || "");
  const subject = `✈️ Order Shipped — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Order Dispatched ✈️</h2>
    <span class="badge" style="background:#dbeafe;color:#1e40af;">✈️ Shipped</span>
    <div class="tbox">
      <div class="row"><span class="lbl">Courier</span><span class="val">${e(courier.partner || courier.name)}</span></div>
      <div class="row"><span class="lbl">AWB Number</span><span class="val">${e(courier.awb_number)}</span></div>
      <div class="row"><span class="lbl">Dispatched On</span><span class="val">${e(fmtDate(courier.dispatched_at || new Date()))}</span></div>
      ${trackingUrl ? `<div class="row"><span class="lbl">Tracking URL</span><span class="val" style="word-break:break-all">${trackingUrl}</span></div>` : ""}
    </div>
    ${buildOrderInfoBox(order, items)}
  `,
      `Order ${order.order_number} shipped`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN tracking updated
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminTrackingUpdated = async (
  order,
  customerName,
  note = "",
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const courier = order.courier || {};
  const trackingUrl = safeUrl(courier.tracking_url || "");
  const subject = `📍 Tracking Updated — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Tracking Updated 📍</h2>
    <span class="badge" style="background:#fef9c3;color:#713f12;">📍 In Transit</span>
    ${note ? `<div class="tbox"><div class="row"><span class="lbl">Update Note</span><span class="val">${e(note)}</span></div></div>` : ""}
    ${buildOrderInfoBox(order, items)}
    ${trackingUrl ? `<div class="box"><div class="row"><span class="lbl">Tracking URL</span><span class="val" style="word-break:break-all">${trackingUrl}</span></div></div>` : ""}
  `,
      `Tracking update for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN order delivered
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminOrderDelivered = async (
  order,
  customerName,
  customerEmail,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `🎉 Order Delivered — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Order Delivered 🎉</h2>
    <span class="badge" style="background:#dcfce7;color:#14532d;">✅ Delivered</span>
    ${buildOrderInfoBox(order, items)}
    <div class="box"><div class="row"><span class="lbl">Delivered On</span><span class="val">${e(fmtDate(order.courier?.delivered_at || new Date()))}</span></div></div>
  `,
      `Order ${order.order_number} delivered`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN order cancelled
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminOrderCancelled = async (
  order,
  customerName,
  customerEmail,
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `❌ Order Cancelled — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Order Cancelled ❌</h2>
    <span class="badge" style="background:#fee2e2;color:#7f1d1d;">❌ Cancelled</span>
    ${buildOrderInfoBox(order, items)}
    ${order.cancel_reason ? `<div class="box"><div class="row"><span class="lbl">Reason</span><span class="val">${e(order.cancel_reason)}</span></div></div>` : ""}
    ${order.payment_status === "refunded" ? `<p style="color:#166534;font-weight:600">✅ ${rupee(order.total_price)} refunded to customer's wallet.</p>` : "<p>Stock has been restored automatically.</p>"}
  `,
      `Order ${order.order_number} cancelled`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN RTO / returned / refunded (status-change driven, e.g. markRTO)
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminOrderRTO = async (
  order,
  customerName,
  type = "rto",
  reason = "",
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const info = RTO_TYPE_MAP[type] || RTO_TYPE_MAP.rto;
  const subject = `${info.label} — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>${e(info.label)}</h2>
    <span class="badge" style="background:${info.bg};color:${info.color};">${info.badge}</span>
    ${buildOrderInfoBox(order, items)}
    ${reason ? `<div class="box"><div class="row"><span class="lbl">Reason</span><span class="val">${e(reason)}</span></div></div>` : ""}
    ${type === "refunded" ? `<p style="color:#166534;font-weight:600">Refund needs to be processed within 5–7 business days.</p>` : ""}
  `,
      `${info.label} for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN return requested (by customer)
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminReturnRequested = async (
  order,
  customerName,
  reason = "",
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `📝 Return Requested — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Return Requested 📝</h2>
    <span class="badge" style="background:#fef9c3;color:#713f12;">⏳ Pending Review</span>
    ${buildOrderInfoBox(order, items)}
    ${reason ? `<div class="box"><div class="row"><span class="lbl">Reason</span><span class="val">${e(reason)}</span></div></div>` : ""}
    <p>Login to the admin panel to approve or reject this return request.</p>
  `,
      `Return requested for order ${order.order_number} by ${customerName}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN return decision — approved / rejected
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminReturnDecision = async (
  order,
  customerName,
  decision = "approved",
  note = "",
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const info = RETURN_DECISION_MAP[decision] || RETURN_DECISION_MAP.approved;
  const subject = `${info.label} — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>${e(info.label)}</h2>
    <span class="badge" style="background:${info.bg};color:${info.color};">${info.badge}</span>
    ${buildOrderInfoBox(order, items)}
    ${note ? `<div class="box"><div class="row"><span class="lbl">Note</span><span class="val">${e(note)}</span></div></div>` : ""}
    ${decision === "approved" ? `<p>Product restocked. Refund the customer using the Refund button once the product is received back.</p>` : ""}
  `,
      `${info.label} for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN refund processed
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminRefundProcessed = async (
  order,
  customerName,
  amount,
  note = "",
  items = [],
) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `💰 Refund Processed — ${order.order_number} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Refund Processed 💰</h2>
    <span class="badge" style="background:#dcfce7;color:#14532d;">💰 Refunded</span>
    <div class="box"><div class="row"><span class="lbl">Refund Amount</span><span class="val">${rupee(amount)}</span></div></div>
    ${buildOrderInfoBox(order, items)}
    ${note ? `<div class="box"><div class="row"><span class="lbl">Note</span><span class="val">${e(note)}</span></div></div>` : ""}
  `,
      `Refund processed for order ${order.order_number}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// user create reviews ADMIN mail send
// ═════════════════════════════════════════════════════════════════════════════
const sendAdminNewReview = async (review, customerName, productName) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;

  const stars =
    "★".repeat(Number(review.rating || 0)) +
    "☆".repeat(5 - Number(review.rating || 0));

  const subject = `⭐ New Review Submitted — ${productName} | ${STORE()}`;

  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>New Customer Review ⭐</h2>
    <span class="badge" style="background:#fef9c3;color:#713f12;">⏳ Pending Approval</span>
    <div class="box">
      <div class="row"><span class="lbl">Customer</span><span class="val">${e(customerName)}</span></div>
      <div class="row"><span class="lbl">Product</span><span class="val">${e(productName)}</span></div>
      <div class="row"><span class="lbl">Rating</span><span class="val" style="color:#f59e0b;font-size:16px">${stars} (${e(review.rating)}/5)</span></div>
      <div class="row"><span class="lbl">Title</span><span class="val">${e(review.title)}</span></div>
      ${review.comment ? `<div class="row"><span class="lbl">Comment</span><span class="val">${e(review.comment)}</span></div>` : ""}
      <div class="row"><span class="lbl">Submitted On</span><span class="val">${e(fmtDate(review.createdAt || new Date()))}</span></div>
    </div>
    <p>Login to the admin panel to approve or reject this review.</p>
    `,
      `New review for ${productName} by ${customerName}`,
    ),
  );
};

module.exports = {
  // User emails
  sendOrderPlaced,
  sendOrderConfirmed,
  sendOrderPacked,
  sendCourierAssigned,
  sendOrderShipped,
  sendTrackingUpdated,
  sendOrderDelivered,
  sendOrderCancelled,
  sendOrderRTO,
  sendReturnRequested,
  sendReturnDecision,
  sendRefundProcessed,
  // Admin emails
  sendAdminNewOrder,
  sendAdminOrderConfirmed,
  sendAdminOrderPacked,
  sendAdminCourierAssigned,
  sendAdminOrderShipped,
  sendAdminTrackingUpdated,
  sendAdminOrderDelivered,
  sendAdminOrderCancelled,
  sendAdminOrderRTO,
  sendAdminReturnRequested,
  sendAdminReturnDecision,
  sendAdminRefundProcessed,

  sendAdminNewReview,
};

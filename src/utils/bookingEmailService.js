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
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  _transporter.verify((err) => {
    if (err) console.error("[Email] ❌ SMTP connection failed:", err.message);
    else console.log("[Email] ✅ SMTP connected — ready to send emails");
  });

  return _transporter;
};

const FROM = () =>
  `"${process.env.SMTP_FROM_NAME || "unity clinic"}" <${process.env.SMTP_USER}>`;
const STORE = () => process.env.STORE_NAME || "unity clinic";
const STORE_URL = () => process.env.STORE_URL || "#";
const ADMIN = () => process.env.ADMIN_EMAIL || null;

const send = async (to, subject, html) => {
  if (!to) return;
  const transport = getTransporter();
  if (!transport) return;
  try {
    await transport.sendMail({ from: FROM(), to, subject, html });
  } catch (err) {
    console.error("[Email] ❌ Send failed:", err.message);
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
// Payment method label — same style as orderEmailService
// ═════════════════════════════════════════════════════════════════════════════
const PAYMENT_LABELS = {
  COD: "Cash on Delivery (COD)",
  partial_cod: "Partial COD",
  Online: "Online Payment (Razorpay)",
  Razorpay: "Online Payment (Razorpay)",
  razorpay: "Online Payment (Razorpay)",
  PhonePe: "PhonePe",
  phonepe: "PhonePe",
  Wallet: "Wallet",
  wallet: "Wallet",
};
const paymentMethodLabel = (method) => PAYMENT_LABELS[method] || method || "—";

// consulting type label — "audio" / "video" -> readable
const typeLabel = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("video")) return "Video Consulting 🎥";
  if (t.includes("audio")) return "Audio Consulting 🎧";
  return e(type) || "Consulting";
};

// ═════════════════════════════════════════════════════════════════════════════
// SHARED BOOKING INFO BOX — Name, Email, Consulting Type, Date, Time Slot,
// Amount, Payment Method
// ═════════════════════════════════════════════════════════════════════════════
const buildBookingInfoBox = (booking) => `
    <div class="box">
      <div class="row"><span class="lbl">Name</span><span class="val">${e(booking.name)}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${e(booking.email)}</span></div>
      <div class="row"><span class="lbl">Mobile</span><span class="val">${e(booking.phone)}</span></div>
      <div class="row"><span class="lbl">Consulting Type</span><span class="val">${typeLabel(booking.type)}</span></div>
    </div>
    <div class="tbox">
      <p style="font-weight:700;color:#1e3a5f;margin-bottom:10px;font-size:14px;">📅 Slot Details</p>
      <div class="row"><span class="lbl">Date</span><span class="val">${e(booking.slot_date) || "To be scheduled"}</span></div>
      <div class="row"><span class="lbl">Time Slot</span><span class="val">${e(booking.slot_time) || "To be scheduled"}</span></div>
      ${booking.slot_duration ? `<div class="row"><span class="lbl">Duration</span><span class="val">${e(booking.slot_duration)} min</span></div>` : ""}
    </div>
    <div class="box">
      ${booking.amount != null ? `<div class="row"><span class="lbl">Amount</span><span class="val">${rupee(booking.amount)}</span></div>` : ""}
      <div class="row"><span class="lbl">Payment Method</span><span class="val">${e(paymentMethodLabel(booking.payment_method || "Online"))}</span></div>
      ${booking.transaction_id ? `<div class="row"><span class="lbl">Transaction ID</span><span class="val">${e(booking.transaction_id)}</span></div>` : ""}
      ${booking.product_title ? `<div class="row"><span class="lbl">Gift Product</span><span class="val">${e(booking.product_title)}</span></div>` : ""}
    </div>
  `;

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
  <div class="hdr"><h1>${e(STORE())}</h1><p>Consultation Booking</p></div>
  <div class="bdy">${body}</div>
  <div class="ftr">&copy; ${new Date().getFullYear()} ${e(STORE())} &nbsp;|&nbsp; <a href="${safeUrl(STORE_URL())}">${e(STORE_URL())}</a><br/>This is an automated email. Please do not reply.</div>
</div>
</body>
</html>`;

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
// 1. BOOKING CREATED (user + admin)
// ═════════════════════════════════════════════════════════════════════════════
const sendBookingCreatedUser = async (booking) => {
  if (!booking.email) return;
  const subject = `Booking Received — ${typeLabel(booking.type)} | ${STORE()}`;
  await send(
    booking.email,
    subject,
    base(
      `
    <h2>Thank you for booking! 🎉</h2>
    <p>Hi <strong>${e(booking.name) || "Customer"}</strong>, we've received your consultation booking request.</p>
    <span class="badge" style="background:#fef3c7;color:#92400e;">🕐 Pending Slot Confirmation</span>
    ${buildBookingInfoBox(booking)}
    <p>Our team will confirm your slot shortly. You'll get another email once your slot is scheduled. 🚀</p>
  `,
      `Booking received for ${typeLabel(booking.type)}`,
    ),
  );
};

const sendBookingCreatedAdmin = async (booking) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `🛒 New Booking — ${typeLabel(booking.type)} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>New Consultation Booking 🛒</h2>
    <span class="badge" style="background:#fef3c7;color:#92400e;">🕐 Pending</span>
    ${buildBookingInfoBox(booking)}
    <p>Login to the admin panel to schedule a slot for this booking.</p>
  `,
      `New booking from ${booking.name || booking.phone}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2. SLOT CONFIRMED / RESCHEDULED (user + admin)
// ═════════════════════════════════════════════════════════════════════════════
const sendSlotConfirmedUser = async (booking) => {
  if (!booking.email) return;
  const subject = `Slot Confirmed — ${e(booking.slot_date)} ${e(booking.slot_time)} | ${STORE()}`;
  await send(
    booking.email,
    subject,
    base(
      `
    <h2>Your consultation slot is confirmed! ✅</h2>
    <p>Hi <strong>${e(booking.name) || "Customer"}</strong>, your consultation has been scheduled.</p>
    <span class="badge" style="background:#dcfce7;color:#166534;">✅ Confirmed</span>
    ${buildBookingInfoBox(booking)}
    <p>Please be available at the scheduled time. We look forward to speaking with you! 💛</p>
  `,
      `Slot confirmed: ${booking.slot_date} ${booking.slot_time}`,
    ),
  );
};

const sendSlotConfirmedAdmin = async (booking) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `✅ Slot Scheduled — ${e(booking.slot_date)} ${e(booking.slot_time)} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Slot Scheduled ✅</h2>
    <span class="badge" style="background:#dcfce7;color:#166534;">✅ Confirmed</span>
    ${buildBookingInfoBox(booking)}
  `,
      `Slot scheduled for ${booking.name || booking.phone}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. BOOKING UPDATED (generic, e.g. via updateBooking) — user + admin
// ═════════════════════════════════════════════════════════════════════════════
const sendBookingUpdatedUser = async (booking) => {
  if (!booking.email) return;
  const subject = `Booking Updated — ${typeLabel(booking.type)} | ${STORE()}`;
  await send(
    booking.email,
    subject,
    base(
      `
    <h2>Your booking has been updated 📝</h2>
    <p>Hi <strong>${e(booking.name) || "Customer"}</strong>, here are your latest booking details.</p>
    <span class="badge" style="background:#e0f2fe;color:#075985;">📝 Updated</span>
    ${buildBookingInfoBox(booking)}
  `,
      `Booking updated`,
    ),
  );
};

const sendBookingUpdatedAdmin = async (booking) => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `📝 Booking Updated — ${typeLabel(booking.type)} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Booking Updated 📝</h2>
    <span class="badge" style="background:#e0f2fe;color:#075985;">📝 Updated</span>
    ${buildBookingInfoBox(booking)}
  `,
      `Booking updated for ${booking.name || booking.phone}`,
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 4. BOOKING CANCELLED / DELETED (user + admin) — optional, use if you add cancel flow
// ═════════════════════════════════════════════════════════════════════════════
const sendBookingCancelledUser = async (booking, reason = "") => {
  if (!booking.email) return;
  const subject = `Booking Cancelled — ${typeLabel(booking.type)} | ${STORE()}`;
  await send(
    booking.email,
    subject,
    base(
      `
    <h2>Your booking has been cancelled</h2>
    <p>Hi <strong>${e(booking.name) || "Customer"}</strong>, unfortunately your consultation booking has been cancelled.</p>
    <span class="badge" style="background:#fee2e2;color:#7f1d1d;">❌ Cancelled</span>
    ${buildBookingInfoBox(booking)}
    ${reason ? `<p><strong>Reason:</strong> ${e(reason)}</p>` : ""}
  `,
      `Booking cancelled`,
    ),
  );
};

const sendBookingCancelledAdmin = async (booking, reason = "") => {
  const adminEmail = ADMIN();
  if (!adminEmail) return;
  const subject = `❌ Booking Cancelled — ${typeLabel(booking.type)} | ${STORE()}`;
  await send(
    adminEmail,
    subject,
    adminBase(
      `
    <h2>Booking Cancelled ❌</h2>
    <span class="badge" style="background:#fee2e2;color:#7f1d1d;">❌ Cancelled</span>
    ${buildBookingInfoBox(booking)}
    ${reason ? `<div class="box"><div class="row"><span class="lbl">Reason</span><span class="val">${e(reason)}</span></div></div>` : ""}
  `,
      `Booking cancelled for ${booking.name || booking.phone}`,
    ),
  );
};

module.exports = {
  sendBookingCreatedUser,
  sendBookingCreatedAdmin,
  sendSlotConfirmedUser,
  sendSlotConfirmedAdmin,
  sendBookingUpdatedUser,
  sendBookingUpdatedAdmin,
  sendBookingCancelledUser,
  sendBookingCancelledAdmin,
};

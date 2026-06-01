const Order = require("../models/Order");
const { sendResponse } = require("../utils/response");
const { verifyIthinkSignature, mapIthinkStatus } = require("../services/ithinkLogistics");
const {
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderRTO,
  sendTrackingUpdated,
  sendAdminOrderShipped,
  sendAdminOrderDelivered,
  sendAdminOrderRTO,
} = require("../utils/orderEmailService");

const getCustomerInfo = (order) => {
  const email = order.user_id?.email || null;
  const name =
    order.user_id?.name ||
    `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
    "Customer";
  return { email, name };
};

// POST /api/webhooks/ithink
// Called by ithink Logistics on every status change
const handleIthinkWebhook = async (req, res) => {
  try {
    // 1. Verify signature
    const signature = req.headers["x-ithink-signature"] || "";
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (!verifyIthinkSignature(rawBody, signature)) {
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    // 2. Parse payload — ithink sends array of events
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      const awb = event.awb_number || event.awb;
      const ithinkStatus = event.current_status || event.status;
      const statusRemark = event.status_remark || "";
      const city = event.city || "";
      const updatedAt = event.updated_at || new Date().toISOString();

      if (!awb || !ithinkStatus) continue;

      // 3. Find our order by AWB
      const order = await Order.findOne({ "courier.awb_number": awb }).populate(
        "user_id",
        "name email"
      );
      if (!order) continue;

      // 4. Map status
      const newStatus = mapIthinkStatus(ithinkStatus);
      if (!newStatus || newStatus === order.status) continue;

      // 5. Update order
      const prevStatus = order.status;
      order.status = newStatus;

      // Update courier tracking
      if (order.courier) {
        order.courier.last_status = ithinkStatus;
        order.courier.last_updated = new Date(updatedAt);
        if (newStatus === "completed") {
          order.courier.delivered_at = new Date(updatedAt);
        }
      }

      // Push to status_history
      order.status_history.push({
        status: newStatus,
        changed_by: "ithink-webhook",
        note: `${ithinkStatus}${city ? " — " + city : ""}${statusRemark ? " · " + statusRemark : ""}`,
        changed_at: new Date(updatedAt),
      });

      await order.save();

      // 6. Send notifications
      const { email, name } = getCustomerInfo(order);

      if (newStatus === "shipped" && prevStatus !== "shipped") {
        sendOrderShipped(order, email, name);
        sendAdminOrderShipped(order, name, email);
      } else if (newStatus === "in_transit") {
        sendTrackingUpdated(order, email, name);
      } else if (newStatus === "completed") {
        sendOrderDelivered(order, email, name);
        sendAdminOrderDelivered(order, name, email);
      } else if (newStatus === "rto") {
        sendOrderRTO(order, email, name);
        sendAdminOrderRTO(order, name, email);
      }
    }

    // Always respond 200 fast — ithink retries on non-200
    res.status(200).json({ success: true, received: events.length });
  } catch (err) {
    console.error("ithink webhook error:", err.message);
    // Still 200 so ithink doesn't spam retries
    res.status(200).json({ success: true, error: err.message });
  }
};

module.exports = { handleIthinkWebhook };
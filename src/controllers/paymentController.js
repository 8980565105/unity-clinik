const Payment = require("../models/Payment");
const OrderItem = require("../models/OrderItem");
const Order = require("../models/Order");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
const Wallet = require("../models/Wallet");
const crypto = require("crypto");
const axios = require("axios");
const { sendResponse } = require("../utils/response");
const mongoose = require("mongoose");

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, order_id } = req.body;

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: "receipt_" + order_id,
    };

    const order = await razorpay.orders.create(options);

    sendResponse(res, true, order, "Razorpay order created");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// RAZORPAY - VERIFY PAYMENT
// ═══════════════════════════════════════════════════════════════════════════════

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      wallet_amount = 0,
      orderData,
    } = req.body;

    if (!razorpay_payment_id) {
      return sendResponse(res, false, null, "razorpay_payment_id missing");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return sendResponse(res, false, null, "Invalid signature");
    }

    let targetOrderId = order_id;
    let order;

    if (orderData) {
      const { saveNewOrder } = require("./orderController");
      order = await saveNewOrder(orderData);
      targetOrderId = order._id;
    } else {
      order = await Order.findById(order_id);
    }

    if (!order) {
      return sendResponse(res, false, null, "Order not found");
    }

    const { activateOrder } = require("./orderController");
    order = await activateOrder(targetOrderId, razorpay_payment_id); // session hatavi

    if (Number(wallet_amount) > 0) {
      const wallet = await Wallet.findOne({ userId: order.user_id });

      if (!wallet || wallet.balance < Number(wallet_amount)) {
        return sendResponse(
          res,
          false,
          null,
          "Insufficient wallet balance at confirm time",
        );
      }

      wallet.balance -= Number(wallet_amount);
      wallet.totalUsed += Number(wallet_amount);
      wallet.transactions.push({
        type: "debit",
        reason: "Used on Order",
        points: Number(wallet_amount),
        orderId: targetOrderId,
        transaction_id: razorpay_payment_id,
      });
      await wallet.save();
    }

    const existingPayment = await Payment.findOne({ order_id: targetOrderId });
    if (existingPayment) {
      await Payment.findByIdAndUpdate(existingPayment._id, {
        transaction_id: razorpay_payment_id,
        status: "completed",
      });
    } else {
      await Payment.create({
        order_id: targetOrderId,
        user_id: order.user_id,
        payment_method: orderData
          ? orderData.payment_method || "Razorpay"
          : "Razorpay",
        amount_paid:
          order.payment_method === "partial_cod"
            ? order.advance_amount || order.total_price
            : order.total_price,
        transaction_id: razorpay_payment_id,
        status: "completed",
        type: "order",
      });
    }

    sendResponse(
      res,
      true,
      { razorpay_payment_id, order_id: targetOrderId },
      "Payment verified",
    );
  } catch (err) {
    sendResponse(res, false, null, err?.error?.description || err.message);
  }
};
// ═══════════════════════════════════════════════════════════════════════════════
// RAZORPAY - WEBHOOK
// ═══════════════════════════════════════════════════════════════════════════════
const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto
      .createHmac("sha256", secret)
      .update(req.body.toString())
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).send("Invalid webhook");
    }

    const event = JSON.parse(req.body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      await Payment.findOneAndUpdate(
        { transaction_id: payment.id },
        { status: "completed" },
      );
      await Order.findOneAndUpdate(
        { transaction_id: payment.id },
        { payment_status: "paid" },
      );
    }

    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("Webhook error");
  }
};

let phonePeToken = { value: null, expiresAt: 0 };

const getPhonePeToken = async () => {
  if (phonePeToken.value && Date.now() < phonePeToken.expiresAt - 60000) {
    return phonePeToken.value;
  }
  const isProduction = process.env.PHONEPE_ENV === "production";
  const tokenUrl = isProduction
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

  const params = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID,
    client_version: process.env.PHONEPE_CLIENT_VERSION,
    client_secret: process.env.PHONEPE_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const res = await axios.post(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  phonePeToken = {
    value: res.data.access_token,
    expiresAt: res.data.expires_at * 1000,
  };
  return phonePeToken.value;
};

const createPhonePePayment = async (req, res) => {
  try {
    const { amount, order_id, user_id, redirect_url } = req.body;
    if (!amount || !order_id || !user_id || !redirect_url) {
      return sendResponse(res, false, null, "Missing required fields");
    }

    const isProduction = process.env.PHONEPE_ENV === "production";
    const payUrl = isProduction
      ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

    const merchantOrderId = `MO${Date.now()}`;
    const token = await getPhonePeToken();

    const payload = {
      merchantOrderId,
      amount: Math.round(amount * 100),
      expireAfter: 1200,
      metaInfo: { udf1: order_id.toString(), udf2: user_id.toString() },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Order Payment",
        merchantUrls: { redirectUrl: redirect_url },
      },
    };

    const response = await axios.post(payUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    });

    if (!response.data.redirectUrl) {
      return sendResponse(res, false, null, "PhonePe initiation failed");
    }

    await Order.findByIdAndUpdate(order_id, {
      merchant_transaction_id: merchantOrderId,
    });

    sendResponse(
      res,
      true,
      {
        paymentUrl: response.data.redirectUrl,
        merchantTransactionId: merchantOrderId,
      },
      "PhonePe order created",
    );
  } catch (err) {
    sendResponse(res, false, null, err?.response?.data?.message || err.message);
  }
};

const verifyPhonePePayment = async (req, res) => {
  try {
    let { merchantTransactionId, order_id } = req.body;
    if (!merchantTransactionId && order_id) {
      const order = await Order.findById(order_id).select(
        "merchant_transaction_id",
      );
      if (!order) return sendResponse(res, false, null, "Order not found");
      if (!order.merchant_transaction_id)
        return sendResponse(
          res,
          false,
          null,
          "merchant_transaction_id missing",
        );
      merchantTransactionId = order.merchant_transaction_id;
    }
    if (!merchantTransactionId)
      return sendResponse(res, false, null, "merchantTransactionId required");

    const isProduction = process.env.PHONEPE_ENV === "production";
    const statusUrl = isProduction
      ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantTransactionId}/status`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantTransactionId}/status`;

    const token = await getPhonePeToken();
    const response = await axios.get(statusUrl, {
      headers: { Authorization: `O-Bearer ${token}` },
    });

    const data = response.data;
    const paymentSuccess = data?.state === "COMPLETED";

    if (!paymentSuccess) {
      return sendResponse(
        res,
        false,
        null,
        `PhonePe payment not successful: ${data?.state}`,
      );
    }

    const transactionId =
      data?.paymentDetails?.[0]?.transactionId || merchantTransactionId;
    const amountPaid = data?.amount ? data.amount / 100 : 0;

    const { activateOrder } = require("./orderController");
    await activateOrder(order_id, transactionId);

    const existingPayment = await Payment.findOne({ order_id });
    if (existingPayment) {
      await Payment.findByIdAndUpdate(existingPayment._id, {
        status: "completed",
        transaction_id: transactionId,
        amount_paid: amountPaid,
        payment_method: "PhonePe",
      });
    } else {
      const order = await Order.findById(order_id);
      await Payment.create({
        order_id,
        user_id: order?.user_id,
        payment_method: "PhonePe",
        amount_paid: amountPaid,
        transaction_id: transactionId,
        status: "completed",
        type: "order",
      });
    }

    sendResponse(
      res,
      true,
      { transactionId, amountPaid },
      "PhonePe payment verified",
    );
  } catch (err) {
    sendResponse(res, false, null, err?.response?.data?.message || err.message);
  }
};

const phonePeWebhook = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";

    const expectedHash = crypto
      .createHash("sha256")
      .update(
        `${process.env.PHONEPE_WEBHOOK_USERNAME}:${process.env.PHONEPE_WEBHOOK_PASSWORD}`,
      )
      .digest("hex");

    if (authHeader !== expectedHash) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;
    const payload = event?.payload;
    const merchantOrderId = payload?.merchantOrderId;
    const state = payload?.state;

    if (!merchantOrderId) {
      return res.status(200).json({ success: true });
    }

    const order = await Order.findOne({
      merchant_transaction_id: merchantOrderId,
    });

    if (!order) {
      return res.status(200).json({ success: true });
    }

    if (state === "COMPLETED") {
      const transactionId =
        payload?.paymentDetails?.[0]?.transactionId || merchantOrderId;
      const amountPaid = payload?.amount ? payload.amount / 100 : 0;

      const { activateOrder } = require("./orderController");
      await activateOrder(order._id, transactionId);

      const existingPayment = await Payment.findOne({ order_id: order._id });
      if (existingPayment) {
        await Payment.findByIdAndUpdate(existingPayment._id, {
          status: "completed",
          transaction_id: transactionId,
          amount_paid: amountPaid,
        });
      } else {
        await Payment.create({
          order_id: order._id,
          user_id: order.user_id,
          payment_method: "PhonePe",
          amount_paid: amountPaid,
          transaction_id: transactionId,
          status: "completed",
          type: "order",
        });
      }
    } else if (state === "FAILED") {
      await Payment.findOneAndUpdate(
        { order_id: order._id },
        { status: "failed" },
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("PhonePe webhook error:", err.message);
    res.status(200).json({ success: true });
  }
};

const getPayments = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
      type,
    } = req.query;

    const download = isDownload.toLowerCase() === "true";
    const userRole = req.user?.role;
    const userId = req.user?._id;
    const query = {};
    if (search) {
      query.$or = [{ transaction_id: { $regex: search, $options: "i" } }];
    }
    if (status && ["pending", "completed", "failed"].includes(status)) {
      query.status = status;
    }
    if (
      type &&
      ["order", "wallet_recharge", "book_consultation"].includes(type)
    ) {
      query.type = type;
    }
    if (userRole === "admin") {
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }
    if (download) {
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate("order_id", "order_number total_price status payment_method")
        .populate("user_id", "name email")
        .populate("coupon_id", "code discount_value")
        .populate("booking_id", "type slot_date slot_time product_title");
      return sendResponse(res, true, { payments }, "All payments for download");
    }
    page = parseInt(page);
    limit = parseInt(limit);
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("order_id", "order_number total_price status payment_method")
      .populate("user_id", "name email")
      .populate("coupon_id", "code discount_value")
      .populate("booking_id", "type slot_date slot_time product_title");
    sendResponse(res, true, {
      payments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("order_id", "order_number total_price status payment_method")
      .populate("user_id", "name email")
      .populate("coupon_id", "code discount_value");
    if (!payment) return sendResponse(res, false, null, "Payment not found");
    sendResponse(res, true, payment, "Payment retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createPayment = async (req, res) => {
  try {
    const {
      user_id,
      order_id,
      payment_method,
      amount_paid,
      discount_amount = 0,
      coupon_id,
      status,
      transaction_id,
    } = req.body;

    const type = "order";

    const payment = new Payment({
      user_id,
      order_id,
      payment_method,
      amount_paid,
      discount_amount,
      coupon_id: coupon_id || null,
      status: status || "pending",
      transaction_id: transaction_id || "",
      type,
    });

    const savedPayment = await payment.save();
    sendResponse(res, true, savedPayment, "Payment created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );
    if (!updatedPayment)
      return sendResponse(res, false, null, "Payment not found");
    sendResponse(res, true, updatedPayment, "Payment updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment)
      return sendResponse(res, false, null, "Payment not found");
    sendResponse(res, true, null, "Payment deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeletePayments = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
    const result = await Payment.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Payments deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    const {
      order_id,
      booking_id,
      user_id,
      payment_method,
      amount,
      type,
      reason,
      transaction_id,
      razorpay_order_id,
      error_code,
    } = req.body;

    let finalAmount = amount;
    if (order_id && !finalAmount) {
      const order = await Order.findById(order_id);
      if (order) {
        finalAmount = order.total_price;
      }
    }

    if (!user_id || !finalAmount) {
      return sendResponse(res, false, null, "user_id and amount are required");
    }

    let payment;
    if (order_id) {
      const existingPayment = await Payment.findOne({
        order_id,
        status: "pending",
      });
      if (existingPayment) {
        existingPayment.status = "failed";
        if (transaction_id) existingPayment.transaction_id = transaction_id;
        payment = await existingPayment.save();
      }
    }

    if (!payment) {
      if (transaction_id) {
        const existing = await Payment.findOne({
          transaction_id,
          status: "failed",
        });
        if (existing) {
          return sendResponse(res, true, existing, "Already recorded");
        }
      }

      payment = await Payment.create({
        order_id: order_id || null,
        booking_id: booking_id || null,
        user_id,
        payment_method: payment_method || "Razorpay",
        amount_paid: finalAmount,
        status: "failed",
        transaction_id: transaction_id || "",
        type: type || "order",
      });
    }

    if (order_id) {
      const order = await Order.findById(order_id);
      if (order && order.payment_status !== "paid") {
        if (order.payment_method === "partial_cod") {
          order.payment_status = "pending";
          await order.save();
          console.log(`Order ${order_id} kept as Payment Pending.`);
        } else {
          await OrderItem.deleteMany({ order_id });
          await Order.findByIdAndDelete(order_id);
          console.log(`Order ${order_id} deleted because payment failed.`);
        }
      }
    }

    sendResponse(res, true, payment, "Payment marked as failed");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  createRazorpayOrder,
  razorpayWebhook,
  verifyRazorpayPayment,
  createPhonePePayment,
  verifyPhonePePayment,
  phonePeWebhook,
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
  markPaymentFailed,
};

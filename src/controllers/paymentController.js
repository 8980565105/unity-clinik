const Payment = require("../models/Payment");
const OrderItem = require("../models/OrderItem");
const Order = require("../models/Order");
const Product = require("../models/Product");
const razorpay = require("../config/razorpay");
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
      user_id,
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

    await Order.findByIdAndUpdate(order_id, {
      payment_status: "paid",
      transaction_id: razorpay_payment_id,
    });

    const existingPayment = await Payment.findOne({ order_id });
    if (existingPayment) {
      await Payment.findByIdAndUpdate(existingPayment._id, {
        transaction_id: razorpay_payment_id,
        status: "completed",
      });
    }

    sendResponse(res, true, { razorpay_payment_id }, "Payment verified");
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

const createPhonePePayment = async (req, res) => {
  try {
    const { amount, order_id, user_id, redirect_url } = req.body;

    if (!amount || !order_id || !user_id || !redirect_url) {
      return sendResponse(res, false, null, "Missing required fields");
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltKeyIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const isProduction = process.env.PHONEPE_ENV === "production";

    const amountInPaisa = Math.round(amount * 100);

    const merchantTransactionId = `MT${Date.now()}`;

    const payload = {
      merchantId,
      merchantTransactionId,
      merchantUserId: `MU${user_id.toString().slice(-12)}`,
      amount: amountInPaisa,
      redirectUrl: redirect_url,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/phonepe/callback`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64",
    );
    const checksumString = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256Hash = crypto
      .createHash("sha256")
      .update(checksumString)
      .digest("hex");
    const checksum = sha256Hash + "###" + saltKeyIndex;

    const phonePeUrl = isProduction
      ? "https://api.phonepe.com/apis/hermes/pg/v1/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    const response = await axios.post(
      phonePeUrl,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json",
        },
      },
    );

    if (!response.data.success) {
      return sendResponse(
        res,
        false,
        null,
        response.data.message || "PhonePe initiation failed",
      );
    }

    const paymentUrl =
      response.data?.data?.instrumentResponse?.redirectInfo?.url;

    if (!paymentUrl) {
      return sendResponse(res, false, null, "PhonePe payment URL missing");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      { merchant_transaction_id: merchantTransactionId },
      {returnDocument: 'after' },
    );

    sendResponse(
      res,
      true,
      { paymentUrl, merchantTransactionId },
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

      console.log("Found order:", order);

      if (!order) {
        return sendResponse(res, false, null, "Order not found");
      }

      if (!order.merchant_transaction_id) {
        return sendResponse(
          res,
          false,
          null,
          `merchant_transaction_id missing in order ${order_id}`,
        );
      }

      merchantTransactionId = order.merchant_transaction_id;
    }

    if (!merchantTransactionId) {
      return sendResponse(res, false, null, "merchantTransactionId required");
    }
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltKeyIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const isProduction = process.env.PHONEPE_ENV === "production";

    const checksumString =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
    const sha256Hash = crypto
      .createHash("sha256")
      .update(checksumString)
      .digest("hex");
    const checksum = sha256Hash + "###" + saltKeyIndex;

    const statusUrl = isProduction
      ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`;

    const response = await axios.get(statusUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
        accept: "application/json",
      },
    });

    console.log("PhonePe status response:", response.data);

    const paymentData = response.data?.data;
    const paymentSuccess =
      response.data?.success && paymentData?.responseCode === "SUCCESS";

    if (!paymentSuccess) {
      return sendResponse(
        res,
        false,
        null,
        `PhonePe payment not successful: ${paymentData?.responseCode}`,
      );
    }

    const transactionId = paymentData?.transactionId || merchantTransactionId;
    const amountPaid = paymentData?.amount ? paymentData.amount / 100 : 0;

    await Order.findByIdAndUpdate(order_id, {
      payment_status: "paid",
      transaction_id: transactionId,
    });

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

const phonePeCallback = async (req, res) => {
  try {
    const { response: encodedResponse } = req.body;

    if (!encodedResponse) {
      return res.status(400).send("No response from PhonePe");
    }

    const decoded = JSON.parse(
      Buffer.from(encodedResponse, "base64").toString("utf-8"),
    );

    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltKeyIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const crypto = require("crypto");

    const receivedChecksum = req.headers["x-verify"];
    const computedHash = crypto
      .createHash("sha256")
      .update(encodedResponse + saltKey)
      .digest("hex");
    const computedChecksum = computedHash + "###" + saltKeyIndex;

    if (receivedChecksum !== computedChecksum) {
      return res.status(400).send("Invalid checksum");
    }

    if (decoded?.code === "PAYMENT_SUCCESS") {
      const txnId = decoded?.data?.transactionId;
      const merchantTxnId = decoded?.data?.merchantTransactionId;
      const amountPaid = decoded?.data?.amount ? decoded.data.amount / 100 : 0;

      const order = await Order.findOne({
        merchant_transaction_id: merchantTxnId,
      });

      if (order) {
        await Order.findByIdAndUpdate(order._id, {
          payment_status: "paid",
          transaction_id: txnId,
        });

        const existingPayment = await Payment.findOne({ order_id: order._id });
        if (existingPayment) {
          await Payment.findByIdAndUpdate(existingPayment._id, {
            status: "completed",
            transaction_id: txnId,
            amount_paid: amountPaid,
          });
        } else {
          await Payment.create({
            order_id: order._id,
            user_id: order.user_id,
            payment_method: "PhonePe",
            amount_paid: amountPaid,
            transaction_id: txnId,
            status: "completed",
          });
        }
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("Callback error");
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
    if (userRole === "admin") {
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }
    if (download) {
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate("order_id", "order_number total_price status payment_method")
        .populate("user_id", "name email")
        .populate("coupon_id", "code discount_value");
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
      .populate("coupon_id", "code discount_value");
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

    const payment = new Payment({
      user_id,
      order_id,
      payment_method,
      amount_paid,
      discount_amount,
      coupon_id: coupon_id || null,
      status: status || "pending",
      transaction_id: transaction_id || "",
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

module.exports = {
  createRazorpayOrder,
  razorpayWebhook,
  verifyRazorpayPayment,
  createPhonePePayment,
  verifyPhonePePayment,
  phonePeCallback,
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
};

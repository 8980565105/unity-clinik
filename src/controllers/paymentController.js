const Payment = require("../models/Payment");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");
const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════
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
    } else if (userRole === "store_owner") {
      query.store_owner_id = userId;
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }
    if (download) {
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate("order_id", "order_number total_price status payment_method")
        .populate("user_id", "name email")
        .populate("store_owner_id", "name email")
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
      .populate("store_owner_id", "name email")
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

// ═══════════════════════════════════════════════════════════════════════════════
// GET PAYMENT BY ID
// ═══════════════════════════════════════════════════════════════════════════════
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("order_id", "order_number total_price status payment_method")
      .populate("user_id", "name email")
      .populate("store_owner_id", "name email")
      .populate("coupon_id", "code discount_value");
    if (!payment) return sendResponse(res, false, null, "Payment not found");
    if (
      req.user?.role === "store_owner" &&
      payment.store_owner_id?._id?.toString() !== req.user._id.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your payment");
    }
    sendResponse(res, true, payment, "Payment retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE PAYMENT
// ═══════════════════════════════════════════════════════════════════════════════
const createPayment = async (req, res) => {
  try {
    const {
      user_id,
      order_id,
      store_owner_id,
      items,
      payment_method,
      amount_paid,
      discount_amount = 0,
      coupon_id,
      status,
      subtotal,
      taxes,
      shipping,
      total,
    } = req.body;
    let resolvedStoreOwnerId = store_owner_id || null;
    if (!resolvedStoreOwnerId && order_id) {
      try {
        const orderItems = await OrderItem.find({ order_id }).populate({
          path: "product_id",
          select: "createdBy",
        });
        if (orderItems.length > 0) {
          const createdBy = orderItems[0]?.product_id?.createdBy;
          if (createdBy) {
            resolvedStoreOwnerId = createdBy;
          }
        }
      } catch (e) {
        console.error("store_owner_id auto-resolve failed:", e.message);
      }
    }
    if (!resolvedStoreOwnerId && items && Array.isArray(items) && items.length > 0) {
      const firstItem = items[0];
      const createdBy =
        firstItem?.product_id?.createdBy?._id ||
        firstItem?.product_id?.createdBy ||
        null;
      if (createdBy) {
        resolvedStoreOwnerId = createdBy;
      }
    }
    const payment = new Payment({
      user_id,
      order_id,
      store_owner_id: resolvedStoreOwnerId,
      payment_method,
      amount_paid,
      discount_amount,
      coupon_id: coupon_id || null,
      status: status || "pending",
    });
    const savedPayment = await payment.save();
    sendResponse(res, true, savedPayment, "Payment created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE PAYMENT
// ═══════════════════════════════════════════════════════════════════════════════
const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedPayment)
      return sendResponse(res, false, null, "Payment not found");
    sendResponse(res, true, updatedPayment, "Payment updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE PAYMENT
// ═══════════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════════
// BULK DELETE PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════
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
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
};

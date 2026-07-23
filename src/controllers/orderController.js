const mongoose = require("mongoose");
const Discount = require("../models/Discount");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Packing = require("../models/paking");
const ProductVariant = require("../models/ProductVariant");
const Product = require("../models/Product");
const Bookconsaltion = require("../models/Bookconsaltans");
const User = require("../models/User");
const walletService = require("../services/walletService");
const { sendResponse } = require("../utils/response");

const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");
const {
  syncOrderToIthink,
  trackIthinkAWB,
  mapIthinkStatus,
  checkPincodeServiceability,
} = require("../services/ithinkLogistics");

const {
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
} = require("../utils/orderEmailService");

const safeString = (val) => {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  return "";
};

const safeObjectIdArray = (val) => {
  const str = safeString(val);
  if (!str) return [];
  return str
    .split(",")
    .map((id) => id.trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};
const safeArray = (val) => (Array.isArray(val) ? val : []);
const getCustomerInfo = (order) => {
  const email = order.user_id?.email || null;
  const name =
    order.user_id?.name ||
    `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
    "Customer";
  return { email, name };
};
const pushHistory = (order, status, changedBy = "admin", note = "") => {
  order.status_history.push({ status, changed_by: changedBy, note });
};
const getTrackingUrl = (partner, awb) => {
  const safeAwb = safeString(awb);
  const urls = {
    Delhivery: `https://www.delhivery.com/track/package/${encodeURIComponent(safeAwb)}`,
    "Blue Dart": `https://www.bluedart.com/web/guest/trackdartcount?Param=WayBill&Val=${encodeURIComponent(safeAwb)}`,
    DTDC: `https://www.dtdc.in/tracking.asp?txconsignno=${encodeURIComponent(safeAwb)}`,
    Shiprocket: `https://shiprocket.co/tracking/${encodeURIComponent(safeAwb)}`,
  };
  return urls[safeString(partner)] || "";
};
const isDiscountValid = (discount) => {
  const now = new Date();
  return (
    discount &&
    discount.status === "active" &&
    discount.start_date <= now &&
    discount.end_date >= now
  );
};

const getEmailItems = async (orderId) => {
  try {
    const items = await OrderItem.find({ order_id: orderId })
      .populate("product_id", "name")
      .populate("variant_id", "sku");
    return items.map((it) => ({
      name: it.product_id?.name || (it.is_gift ? "Gift Item" : "Product"),
      sku: it.variant_id?.sku || "",
      quantity: it.quantity,
      price: it.price_at_order,
    }));
  } catch (_) {
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GET ALL ORDERS  — admin & store_owner only (authenticated)
// ═══════════════════════════════════════════════════════════════════════════════
const getOrders = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
      user,
      product,
      color,
      size,
      startDate,
      endDate,
      minPrice,
      maxPrice,
    } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    const download = safeString(isDownload).toLowerCase() === "true";
    const role = req.user?.role;
    if (role === "store_user") {
      return sendResponse(
        res,
        false,
        null,
        "Forbidden: Use /orders/public instead",
      );
    }
    const safeSearch = safeString(search);
    const orderMatch = {};
    const validStatuses = [
      "pending",
      "processing",
      "packed",
      "ready_to_ship",
      "shipped",
      "in_transit",
      "completed",
      "cancelled",
      "rto",
      "returned",
      "refunded",
    ];
    const safeStatus = safeString(status);
    if (safeStatus && validStatuses.includes(safeStatus)) {
      orderMatch.status = safeStatus;
    }
    if (user && role === "admin") {
      const userArray = safeObjectIdArray(user);
      if (userArray.length > 0) {
        orderMatch.user_id = { $in: userArray };
      }
    }
    if (startDate || endDate) {
      orderMatch.createdAt = {};
      if (startDate) {
        const d = new Date(safeString(startDate));
        if (!isNaN(d.getTime())) orderMatch.createdAt.$gte = d;
      }
      if (endDate) {
        const d = new Date(safeString(endDate));
        if (!isNaN(d.getTime())) orderMatch.createdAt.$lte = d;
      }
    }
    if (minPrice || maxPrice) {
      orderMatch.total_price = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (minPrice && !isNaN(min)) orderMatch.total_price.$gte = min;
      if (maxPrice && !isNaN(max)) orderMatch.total_price.$lte = max;
    }
    const itemMatch = {};
    if (product) {
      const productArray = safeObjectIdArray(product);
      if (productArray.length > 0) itemMatch.product_id = { $in: productArray };
    }
    if (size) {
      const sizeArray = safeObjectIdArray(size);
      if (sizeArray.length > 0)
        itemMatch["variant_id.size_id"] = { $in: sizeArray };
    }
    if (role === "store_owner") {
      const ownerProducts = await Product.find(
        { createdBy: req.user._id },
        { _id: 1 },
      );
      const ownerProductIds = ownerProducts.map((p) => p._id);
      if (ownerProductIds.length === 0) {
        return sendResponse(res, true, {
          orders: [],
          total: 0,
          page,
          pages: 0,
        });
      }
      const ownerOrderItems = await OrderItem.find(
        { product_id: { $in: ownerProductIds } },
        { order_id: 1 },
      );
      const ownerOrderIds = [
        ...new Set(ownerOrderItems.map((oi) => oi.order_id.toString())),
      ].map((id) => new mongoose.Types.ObjectId(id));
      if (ownerOrderIds.length === 0) {
        return sendResponse(res, true, {
          orders: [],
          total: 0,
          page,
          pages: 0,
        });
      }
      orderMatch._id = { $in: ownerOrderIds };
    }
    const searchStage = safeSearch
      ? [
          {
            $match: {
              $or: [
                { order_number: { $regex: safeSearch, $options: "i" } },
                { "user.name": { $regex: safeSearch, $options: "i" } },
                { "user.email": { $regex: safeSearch, $options: "i" } },
                {
                  "shippingAddress.phone": {
                    $regex: safeSearch,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]
      : [];
    const pipeline = [
      { $match: orderMatch },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ...searchStage,
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order_id",
          as: "items",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $lookup: {
                from: "productvariants",
                localField: "variant_id",
                foreignField: "_id",
                as: "variant",
                pipeline: [
                  {
                    $lookup: {
                      from: "colors",
                      localField: "color_id",
                      foreignField: "_id",
                      as: "color",
                    },
                  },
                  {
                    $lookup: {
                      from: "sizes",
                      localField: "size_id",
                      foreignField: "_id",
                      as: "size",
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },
            { $match: Object.keys(itemMatch).length ? itemMatch : {} },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
    ];
    if (!download) {
      pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
    }
    const orders = await Order.aggregate(pipeline);
    const countPipeline = [
      { $match: orderMatch },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ...searchStage,
      { $count: "total" },
    ];
    const totalCountAgg = await Order.aggregate(countPipeline);
    const total = totalCountAgg[0]?.total || 0;
    sendResponse(res, true, {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return sendResponse(res, false, null, "Unauthorized");
    }
    let { page = 1, limit = 5, search = "" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 5;
    const safeSearch = safeString(search);
    const orderMatch = {
      user_id: new mongoose.Types.ObjectId(userId),
    };
    if (safeSearch) {
      orderMatch.$and = [
        { user_id: new mongoose.Types.ObjectId(userId) },
        {
          $or: [
            { status: { $regex: safeSearch, $options: "i" } },
            { order_number: { $regex: safeSearch, $options: "i" } },
          ],
        },
      ];
      delete orderMatch.user_id;
    }
    const pipeline = [
      { $match: orderMatch },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order_id",
          as: "items",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $lookup: {
                from: "productvariants",
                localField: "variant_id",
                foreignField: "_id",
                as: "variant",
                pipeline: [
                  {
                    $lookup: {
                      from: "colors",
                      localField: "color_id",
                      foreignField: "_id",
                      as: "color",
                    },
                  },
                  {
                    $lookup: {
                      from: "sizes",
                      localField: "size_id",
                      foreignField: "_id",
                      as: "size",
                    },
                  },
                ],
              },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];
    const orders = await Order.aggregate(pipeline);
    const totalCountAgg = await Order.aggregate([
      { $match: orderMatch },
      { $count: "total" },
    ]);
    const total = totalCountAgg[0]?.total || 0;
    sendResponse(res, true, {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GET ORDER BY ID  — role check
// ═══════════════════════════════════════════════════════════════════════════════
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email")
      .populate("coupon_id", "code discount_value")
      .populate("packing_id");

    if (!order) return sendResponse(res, false, null, "Order not found");

    if (
      req.user?.role === "store_user" &&
      order.user_id?._id?.toString() !== req.user._id.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your order");
    }

    if (req.user?.role === "store_owner") {
      const ownerProducts = await Product.find(
        { createdBy: req.user._id },
        { _id: 1 },
      );
      const ownerProductIds = ownerProducts.map((p) => p._id.toString());
      const items = await OrderItem.find(
        { order_id: order._id },
        { product_id: 1 },
      );
      const hasOwnerProduct = items.some((item) =>
        ownerProductIds.includes(item.product_id.toString()),
      );
      if (!hasOwnerProduct) {
        return sendResponse(res, false, null, "Forbidden: Not your order");
      }
    }

    const items = await OrderItem.find({ order_id: order._id })
      .populate("product_id", "name price sku")
      .populate({
        path: "variant_id",
      });

    sendResponse(res, true, { order, items }, "Order retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
// ═══════════════════════════════════════════════════════════════════════════════
// 3. CREATE ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const saveNewOrder = async (orderData, session = null) => {
  const {
    user_id,
    coupon_id,
    shippingAddress,
    payment_method = "COD",
    advance_amount = 0,
    transaction_id,
    shipping_charge = 0,
    coupon_discount = 0,
    subtotal = 0,
    total_price,
    items: rawItems,
  } = orderData;

  const pincode = shippingAddress?.pincode;
  if (!pincode) {
    throw new Error("Pincode is required");
  }
  const serviceCheck = await checkPincodeServiceability(pincode);
  if (!serviceCheck.serviceable) {
    throw new Error("Service not available in your pincode");
  }

  const items = safeArray(rawItems);
  if (!items.length) {
    throw new Error("No items provided");
  }
  let calculatedProductTotal = 0;
  const orderItems = [];
  let couponDoc = null;
  if (coupon_id) {
    const Coupon = require("../models/Coupon");
    couponDoc = await Coupon.findById(coupon_id).session(session);

    if (!couponDoc) {
      throw new Error("Invalid coupon");
    }

    if (couponDoc.status !== "active") {
      throw new Error("Coupon is not active");
    }

    const now = new Date();
    if (couponDoc.start_date && now < couponDoc.start_date) {
      throw new Error("Coupon is not started yet");
    }
    if (couponDoc.end_date && now > couponDoc.end_date) {
      throw new Error("Coupon has expired");
    }

    if (
      couponDoc.usage_limit !== null &&
      couponDoc.used_count >= couponDoc.usage_limit
    ) {
      throw new Error("Coupon usage limit reached");
    }

    if (couponDoc.userusage_limit !== null) {
      const userEntry = (couponDoc.user_usage || []).find(
        (u) => u.user_id.toString() === user_id.toString(),
      );
      const userUsedCount = userEntry ? userEntry.count : 0;

      if (userUsedCount >= couponDoc.userusage_limit) {
        throw new Error("You have already used this coupon maximum times");
      }
    }

    if (couponDoc.coupon_type === "first_order") {
      const previousOrders = await Order.countDocuments({
        user_id: user_id,
        status: { $nin: ["cancelled"] },
      }).session(session);

      if (previousOrders > 0) {
        throw new Error("This coupon is only valid on your first order!");
      }

      const alreadyUsed = await Order.findOne({
        user_id: user_id,
        coupon_id: couponDoc._id,
        status: { $nin: ["cancelled"] },
      }).session(session);

      if (alreadyUsed) {
        throw new Error("You have already used this coupon!");
      }
    }
  }

  for (const item of items) {
    if (item.is_gift === true) {
      orderItems.push({
        order_id: null,
        product_id: item.product_id,
        variant_id: null,
        quantity: item.quantity || 1,
        price_at_order: 0,
        is_gift: true,
      });
      continue;
    }
    const variant = await ProductVariant.findById(item.variant_id)
      .populate("product_id")
      .session(session);
    if (!variant) throw new Error("Variant not found");
    if (variant.stock_quantity < item.quantity)
      throw new Error(`Not enough stock for ${variant.sku}`);
    let price = variant.price;
    if (
      variant.offerprice &&
      variant.offerprice > 0 &&
      variant.offerprice < price
    ) {
      price = variant.offerprice;
    } else {
      const discount_id = variant.product_id.discount_id;
      if (discount_id) {
        const discount = await Discount.findById(discount_id).session(session);
        if (isDiscountValid(discount)) {
          if (discount.type === "percentage")
            price = price - (price * discount.value) / 100;
          else if (discount.type === "fixed") price = price - discount.value;
          if (price < 0) price = 0;
        }
      }
    }
    calculatedProductTotal += price * item.quantity;
    orderItems.push({
      order_id: null,
      product_id: variant.product_id._id,
      variant_id: variant._id,
      quantity: item.quantity,
      price_at_order: price,
    });
  }

  let consultationGiftBooking = null;
  if (user_id) {
    consultationGiftBooking = await Bookconsaltion.findOne({
      user_id,
      slot_status: "confirmed",
      is_redeemed: false,
      product_id: { $ne: null },
    })
      .sort({ createdAt: 1 })
      .session(session);

    if (consultationGiftBooking) {
      orderItems.push({
        order_id: null,
        product_id: consultationGiftBooking.product_id,
        variant_id: null,
        quantity: 1,
        price_at_order: 0,
        is_gift: true,
        is_consultation_gift: true,
      });
    }
  }

  const finalTotal =
    Number(subtotal || calculatedProductTotal) + Number(shipping_charge || 0);

  const order = new Order({
    user_id,
    subtotal: Number(subtotal) || calculatedProductTotal,
    advance_amount: Number(advance_amount) || 0,
    shipping_charge: Number(shipping_charge) || 0,
    coupon_discount: Number(coupon_discount) || 0,
    total_price: Number(total_price) || finalTotal,
    coupon_id: coupon_id || null,
    shippingAddress,
    payment_method,
    payment_status:
      (payment_method === "Online" || payment_method === "Wallet") &&
      (transaction_id || payment_method === "Wallet")
        ? "paid"
        : "pending",
    transaction_id: transaction_id || "",
    status: "pending",
  });

  pushHistory(order, "pending", "customer", "Order placed");
  const savedOrder = await order.save({ session });

  if (payment_method === "Wallet") {
    const Wallet = require("../models/Wallet");
    const wallet = await Wallet.findOne({ userId: user_id }).session(session);
    if (!wallet || wallet.balance < savedOrder.total_price) {
      throw new Error("Insufficient wallet balance");
    }
    wallet.balance -= savedOrder.total_price;
    wallet.totalUsed += savedOrder.total_price;
    wallet.transactions.push({
      type: "debit",
      reason: "Used on Order",
      points: savedOrder.total_price,
      orderId: savedOrder._id,
    });
    await wallet.save({ session });
  }

  if (
    consultationGiftBooking &&
    (payment_method === "COD" || payment_method === "Wallet")
  ) {
    consultationGiftBooking.is_redeemed = true;
    consultationGiftBooking.redeemed_order_id = savedOrder._id;
    await consultationGiftBooking.save({ session });
  }

  orderItems.forEach((oi) => (oi.order_id = savedOrder._id));
  await OrderItem.insertMany(orderItems, { session });

  return savedOrder;
};

const createOrder = async (req, res) => {
  try {
    const savedOrder = await saveNewOrder(req.body);
    if (
      savedOrder.payment_method === "COD" ||
      savedOrder.payment_method === "Wallet"
    ) {
      const orderItems = await OrderItem.find({ order_id: savedOrder._id });
      for (const item of orderItems) {
        if (item.is_gift) continue;
        if (!item.variant_id) continue;
        const variant = await ProductVariant.findById(item.variant_id);
        if (variant) {
          variant.stock_quantity -= item.quantity;
          await variant.save();
        }
      }
      try {
        const populatedOrder = await Order.findById(savedOrder._id).populate(
          "user_id",
        );
        const populatedItems = await OrderItem.find({
          order_id: savedOrder._id,
        })
          .populate("product_id", "name")
          .populate("variant_id", "sku");
        await syncOrderToIthink({
          order: populatedOrder,
          orderItems: populatedItems,
        });
        savedOrder.status_history.push({
          status: "pending",
          changed_by: "system",
          note: "Order synced to iThink dashboard — awaiting AWB/courier assignment",
          changed_at: new Date(),
        });
        await savedOrder.save();
      } catch (err) {
        console.error("iThink sync error (createOrder):", err.message);
        savedOrder.status_history.push({
          status: "pending",
          changed_by: "system",
          note: "iThink sync failed: " + err.message,
          changed_at: new Date(),
        });
        await savedOrder.save();
      }
    }
    sendResponse(res, true, savedOrder, "Order created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const activateOrder = async (orderId, transactionId = "", session = null) => {
  const order = await Order.findById(orderId).session(session);
  if (!order) throw new Error("Order not found");

  if (order.payment_status === "paid") {
    return order;
  }

  order.payment_status = "paid";
  if (transactionId) {
    order.transaction_id = transactionId;
  }
  await order.save({ session });

  const orderItems = await OrderItem.find({ order_id: orderId }).session(
    session,
  );

  for (const item of orderItems) {
    if (item.is_gift) continue;
    if (!item.variant_id) continue;
    const variant = await ProductVariant.findById(item.variant_id).session(
      session,
    );
    if (variant) {
      variant.stock_quantity -= item.quantity;
      await variant.save({ session });
    }
  }

  const hasConsultationGift = orderItems.some(
    (item) => item.is_consultation_gift,
  );
  if (hasConsultationGift && order.user_id) {
    await Bookconsaltion.findOneAndUpdate(
      {
        user_id: order.user_id,
        slot_status: "confirmed",
        is_redeemed: false,
        product_id: { $ne: null },
      },
      { $set: { is_redeemed: true, redeemed_order_id: order._id } },
      { sort: { createdAt: 1 } },
    ).session(session);
  }

  if (order.coupon_id) {
    const Coupon = require("../models/Coupon");
    const couponDoc = await Coupon.findById(order.coupon_id).session(session);
    if (couponDoc) {
      const userEntry = (couponDoc.user_usage || []).find(
        (u) => u.user_id.toString() === order.user_id.toString(),
      );
      if (userEntry) {
        await Coupon.updateOne(
          { _id: order.coupon_id, "user_usage.user_id": order.user_id },
          {
            $inc: {
              used_count: 1,
              "user_usage.$.count": 1,
            },
          },
        ).session(session);
      } else {
        await Coupon.updateOne(
          { _id: order.coupon_id },
          {
            $inc: { used_count: 1 },
            $push: { user_usage: { user_id: order.user_id, count: 1 } },
          },
        ).session(session);
      }
    }
  }

  try {
    const populatedOrder = await Order.findById(order._id)
      .populate("user_id")
      .session(session);
    const populatedItems = await OrderItem.find({ order_id: order._id })
      .populate("product_id")
      .populate("variant_id")
      .session(session);

    await syncOrderToIthink({
      order: populatedOrder,
      orderItems: populatedItems,
    });

    order.status_history.push({
      status: "pending",
      changed_by: "system",
      note: "Order pushed to iThink dashboard — awaiting courier assignment",
      changed_at: new Date(),
    });
    await order.save({ session });
  } catch (err) {
    console.error("iThink push error in activateOrder:", err.message);
    order.status_history.push({
      status: "pending",
      changed_by: "system",
      note: "iThink push failed: " + err.message,
      changed_at: new Date(),
    });
    await order.save({ session });
  }
  try {
    const populatedForEmail = await Order.findById(order._id)
      .populate("user_id", "name email")
      .session(session);
    const { email: placedEmail, name: placedName } = getCustomerInfo(
      populatedForEmail || order,
    );
    const emailItems = await getEmailItems(order._id);
    await sendOrderPlaced(
      populatedForEmail || order,
      placedEmail,
      placedName,
      emailItems,
    );
    await sendAdminNewOrder(
      populatedForEmail || order,
      placedName,
      placedEmail,
      emailItems,
    );
  } catch (emailErr) {
    console.error("Email send error in activateOrder:", emailErr.message);
  }

  return order;
};


const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");
    if (order.status !== "pending")
      return sendResponse(
        res,
        false,
        null,
        `Order is already '${order.status}'`,
      );

    const items = await OrderItem.find({ order_id: order._id }).populate(
      "product_id",
      "name sku weight",
    );
    const packingItems = items.map((item) => ({
      product_id: item.product_id?._id,
      name: item.product_id?.name || "Product",
      sku: item.product_id?.sku || "",
      quantity: item.quantity,
      price: item.price_at_order,
      weight: item.product_id?.weight || 0,
    }));
    const totalWeight = packingItems.reduce(
      (sum, i) => sum + i.weight * i.quantity,
      0,
    );

    const packing = new Packing({
      order_id: order._id,
      order_number: order.order_number,
      customer: {
        name:
          order.user_id?.name ||
          `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim(),
        mobile: order.shippingAddress?.phone || "",
        email: order.user_id?.email || "",
      },
      shippingAddress: order.shippingAddress,
      items: packingItems,
      total_amount: order.total_price,
      total_weight: totalWeight,
      cod_amount: order.payment_method === "COD" ? order.total_price : 0,
      packed_by: req.user?.name || "admin",
    });
    await packing.save();

    order.status = "processing";
    order.packing_id = packing._id;
    if (req.body.admin_note) order.admin_note = req.body.admin_note;
    pushHistory(
      order,
      "processing",
      req.user?.name || "admin",
      req.body.admin_note ||
        "Order confirmed. Already available on iThink dashboard — assign courier there.",
    );

    await order.save();
    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderConfirmed(order, email, name, emailItems);
    sendAdminOrderConfirmed(order, name, email, emailItems);
    sendResponse(res, true, { order, packing }, "Order confirmed");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CANCEL ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    const isAdmin = ["admin", "store_owner"].includes(req.user?.role);
    const isOwner = order.user_id?._id?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return sendResponse(res, false, null, "Forbidden: Not your order");
    }

    if (
      ["cancelled", "completed", "refunded", "returned", "rto"].includes(
        order.status,
      )
    ) {
      return sendResponse(
        res,
        false,
        null,
        `Cannot cancel order with status '${order.status}'`,
      );
    }

    if (!isAdmin) {
      const hoursSincePlaced =
        (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSincePlaced > 24) {
        return sendResponse(
          res,
          false,
          null,
          "Cancellation window (24 hours) has expired. Please contact support.",
        );
      }
      if (["shipped", "in_transit"].includes(order.status)) {
        return sendResponse(
          res,
          false,
          null,
          "Order is already shipped. Contact support to cancel.",
        );
      }
    }

    const { reason = "Cancelled by customer" } = req.body;
    order.status = "cancelled";
    order.cancel_reason = safeString(reason);
    pushHistory(
      order,
      "cancelled",
      req.user?.name || (isAdmin ? "admin" : "customer"),
      safeString(reason),
    );
    await order.save();

    const items = await OrderItem.find({ order_id: order._id });
    for (const item of items) {
      const variant = await ProductVariant.findById(item.variant_id);
      if (variant) {
        variant.stock_quantity += item.quantity;
        await variant.save();
      }
    }

    // AUTO REFUND TO WALLET (same as before)
    if (
      order.payment_status === "paid" &&
      (order.payment_method === "Online" ||
        order.payment_method === "Wallet" ||
        order.payment_method === "partial_cod")
    ) {
      if (order.payment_status !== "refunded") {
        let refundAmount = order.total_price;
        if (order.payment_method === "partial_cod") {
          refundAmount = order.advance_amount || order.total_price;
        }
        await walletService.creditWallet(
          order.user_id._id || order.user_id,
          refundAmount,
          `Refund for cancelled Order #${order.order_number}`,
          { orderId: order._id },
        );
        order.payment_status = "refunded";
        await order.save();
      }
    }

    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderCancelled(order, email, name, emailItems);
    sendAdminOrderCancelled(order, name, email, emailItems);

    let message = "Order cancelled successfully";
    if (order.payment_status === "refunded") {
      message += `. ₹${order.total_price} refunded to customer's wallet.`;
    }
    sendResponse(res, true, order, message);
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
// ═══════════════════════════════════════════════════════════════════════════════
// 6. PACK ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const packOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");
    if (order.status !== "processing")
      return sendResponse(
        res,
        false,
        null,
        "Order must be in processing state to pack",
      );
    const warehouse_name = safeString(req.body.warehouse_name);
    order.status = "packed";
    pushHistory(
      order,
      "packed",
      req.user?.name || "admin",
      `Packed at ${warehouse_name || "warehouse"}`,
    );
    await order.save();
    if (order.packing_id) {
      await Packing.findByIdAndUpdate(order.packing_id, {
        status: "packed",
        warehouse_name: warehouse_name || "",
        packed_at: new Date(),
      });
    }
    const packing = order.packing_id
      ? await Packing.findById(order.packing_id)
      : null;
    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderPacked(order, email, name, emailItems);
    sendAdminOrderPacked(order, name, email, emailItems);
    sendResponse(res, true, { order, packing }, "Order packed");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. GENERATE PACKING SLIP
// ═══════════════════════════════════════════════════════════════════════════════
const generatePackingSlip = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, false, null, "Order not found");
    if (!order.packing_id)
      return sendResponse(
        res,
        false,
        null,
        "No packing record found for this order",
      );

    const packing = await Packing.findById(order.packing_id);
    if (!packing) return sendResponse(res, false, null, "Packing not found");

    const liveItems = await OrderItem.find({ order_id: order._id })
      .populate("product_id", "name")
      .populate("variant_id", "sku");
    const itemInfoMap = {};
    liveItems.forEach((li) => {
      const pid = li.product_id?._id?.toString();
      if (pid) {
        itemInfoMap[pid] = {
          name: li.product_id?.name || "",
          sku: li.variant_id?.sku || "",
        };
      }
    });

    const resolvedItems = packing.items.map((item) => {
      const pid = item.product_id?.toString();
      const live = pid ? itemInfoMap[pid] : null;
      return {
        ...(item.toObject ? item.toObject() : item),
        name: live?.name || item.name || "—",
        sku: live?.sku || item.sku || "—",
      };
    });

    const qrData = [
      `Order: ${packing.order_number}`,
      `ID: ${order._id}`,
      `Customer: ${packing.customer?.name || ""}`,
      `Total: Rs.${packing.total_amount}`,
      packing.cod_amount > 0
        ? `COD: Rs.${packing.cod_amount}`
        : "Payment: Online",
      order.courier?.awb_number ? `AWB: ${order.courier.awb_number}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const qrBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: "M",
      width: 120,
      margin: 1,
      color: { dark: "#1e3a5f", light: "#ffffff" },
    });

    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: packing.order_number,
      scale: 2,
      height: 10,
      includetext: true,
      textxalign: "center",
      textfont: "Helvetica",
      textsize: 8,
      paddingwidth: 4,
      paddingheight: 2,
      backgroundcolor: "ffffff",
      barcolor: "1e3a5f",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=slip-${order.order_number}.pdf`,
    );

    const doc = new PDFDocument({ margin: 30, size: "A5", layout: "portrait" });
    doc.pipe(res);

    const PW = doc.page.width;
    const L = 30;
    const R = PW - 30;
    const W = R - L;

    doc.rect(L, 20, W, 28).fill("#1e3a5f");
    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("PACKING SLIP", L, 27, { width: W, align: "center" });
    doc.fillColor("black");

    let y = 60;

    const INFO_H = 92;
    const col1W = W * 0.5;
    const col2X = L + col1W + 8;
    const col2W = W - col1W - 8;

    doc.rect(L, y, col1W, INFO_H).stroke("#cccccc");
    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#555555")
      .text("ORDER INFORMATION", L + 5, y + 5);
    doc.fillColor("#000000");

    const oi = [
      ["Order No", packing.order_number],
      ["Order ID", order._id.toString()],
      ["Date", new Date(order.createdAt).toLocaleDateString("en-IN")],
      [
        "Payment",
        order.payment_method === "COD"
          ? `COD ${packing.cod_amount}`
          : "Online Paid",
      ],
      ["Warehouse", packing.warehouse_name || "—"],
    ];

    let oiy = y + 17;
    oi.forEach(([label, val]) => {
      const isId = label === "Order ID";
      doc
        .font("Helvetica-Bold")
        .fontSize(isId ? 6 : 7.5)
        .text(`${label}:`, L + 5, oiy, { continued: true })
        .font("Helvetica")
        .fontSize(isId ? 6 : 7.5)
        .text(` ${val}`, { lineBreak: false });
      oiy += isId ? 11 : 13;
    });

    doc.rect(col2X, y, col2W, INFO_H).stroke("#cccccc");
    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor("#555555")
      .text("SHIP TO", col2X + 5, y + 5);
    doc.fillColor("#000000");

    const addr = packing.shippingAddress || {};
    const shipName =
      packing.customer?.name ||
      `${addr.firstName || ""} ${addr.lastName || ""}`.trim() ||
      "Customer";

    let sy = y + 17;
    const shipBoxW = col2W - 10;

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(shipName, col2X + 5, sy, { width: shipBoxW, lineBreak: false });
    sy += 12;

    if (addr.address) {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .text(addr.address, col2X + 5, sy, { width: shipBoxW });
      sy += Math.max(doc.heightOfString(addr.address, { width: shipBoxW }), 11);
    }

    const cityLine = [
      addr.city,
      addr.state,
      addr.pincode ? `— ${addr.pincode}` : "",
    ]
      .filter(Boolean)
      .join(", ");
    if (cityLine) {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .text(cityLine, col2X + 5, sy, { width: shipBoxW, lineBreak: false });
      sy += 11;
    }

    const phone = addr.phone || packing.customer?.mobile || "—";
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .text(`Ph: ${phone}`, col2X + 5, sy, {
        width: shipBoxW,
        lineBreak: false,
      });

    y += INFO_H + 8;

    const barcodeW = W * 0.65;
    const barcodeH = 40;
    const barcodeX = L + (W - barcodeW) / 2;
    doc.image(barcodeBuffer, barcodeX, y, {
      width: barcodeW,
      height: barcodeH,
    });
    y += barcodeH + 6;

    const cols = [
      { x: L, w: W * 0.36, label: "Product", align: "left" },
      { x: L + W * 0.36, w: W * 0.15, label: "SKU", align: "left" },
      { x: L + W * 0.51, w: W * 0.09, label: "Qty", align: "center" },
      { x: L + W * 0.6, w: W * 0.18, label: "Price", align: "right" },
      { x: L + W * 0.78, w: W * 0.22, label: "Total", align: "center" },
    ];

    const TH = 16;
    doc.rect(L, y, W, TH).fill("#1e3a5f");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(7.5);
    cols.forEach((c) => {
      doc.text(c.label, c.x + 3, y + 4, {
        width: c.w - 6,
        align: c.align,
        lineBreak: false,
      });
    });
    doc.fillColor("black");
    const tableStartY = y;
    y += TH;

    doc.font("Helvetica").fontSize(7.5);
    let totalQty = 0;

    resolvedItems.forEach((item, rowIndex) => {
      const rowH = 16;
      if (rowIndex % 2 === 0) {
        doc.rect(L, y, W, rowH).fill("#f5f7fa");
      }
      doc.fillColor("#000000");
      doc.text(item.name || "—", cols[0].x + 3, y + 4, {
        width: cols[0].w - 6,
        align: "left",
        lineBreak: false,
      });
      doc.text(item.sku, cols[1].x + 3, y + 4, {
        width: cols[1].w - 6,
        align: "left",
        lineBreak: false,
      });
      doc.text(String(item.quantity), cols[2].x + 3, y + 4, {
        width: cols[2].w - 6,
        align: "center",
        lineBreak: false,
      });
      doc.text(
        `${Number(item.price).toLocaleString("en-IN")}`,
        cols[3].x + 3,
        y + 4,
        { width: cols[3].w - 6, align: "center", lineBreak: false },
      );
      doc.text(
        `${(Number(item.price) * item.quantity).toLocaleString("en-IN")}`,
        cols[4].x + 3,
        y + 4,
        { width: cols[4].w - 6, align: "center", lineBreak: false },
      );
      totalQty += item.quantity;
      y += rowH;
    });

    doc
      .rect(L, tableStartY, W, TH + resolvedItems.length * 16)
      .stroke("#cccccc");

    y += 8;
    doc.moveTo(L, y).lineTo(R, y).stroke("#cccccc");
    y += 10;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#1e3a5f")
      .text("Grand Total", L, y, {
        width: W * 0.6,
        align: "left",
        lineBreak: false,
      });
    doc.text(
      `Rs. ${Number(packing.total_amount).toLocaleString("en-IN")}`,
      L + W * 0.6,
      y,
      { width: W * 0.4, align: "right", lineBreak: false },
    );
    doc.fillColor("black");
    y += 18;

    const QR_SIZE = 80;
    const qrX = L + (W - QR_SIZE) / 2;
    doc.image(qrBuffer, qrX, y, { width: QR_SIZE, height: QR_SIZE });
    y += QR_SIZE + 4;
    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#888888")
      .text("Scan to verify order", L, y, { width: W, align: "center" });
    doc.fillColor("black");
    y += 14;

    if (order.payment_method === "COD") {
      y += 4;
      doc.rect(L, y, W, 22).fill("#fff3cd").stroke("#ffc107");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#7d4e00")
        .text(
          `COD COLLECTION: Rs. ${Number(packing.cod_amount).toLocaleString("en-IN")}`,
          L + 5,
          y + 6,
          { width: W - 10, align: "center" },
        );
      doc.fillColor("black");
      y += 30;
    }

    y += 8;
    doc.moveTo(L, y).lineTo(R, y).stroke("#cccccc");
    y += 6;
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor("#666666")
      .text("Thank you for shopping with us!", L, y, {
        width: W,
        align: "center",
      });

    doc.end();

    await Packing.findByIdAndUpdate(order.packing_id, { slip_generated: true });
  } catch (err) {
    if (!res.headersSent) sendResponse(res, false, null, err.message);
  }
};
// ═══════════════════════════════════════════════════════════════════════════════
// 8. ASSIGN COURIER
// ═══════════════════════════════════════════════════════════════════════════════

const assignCourier = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");
    const partner = safeString(req.body.partner);
    let awb_number = safeString(req.body.awb_number);
    let tracking_url = "";
    let label_url = null;
    if (partner === "ithink") {
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate("product_id", "name")
        .populate(
          "variant_id",
          "sku ProductWeight ProductHeight ProductWidth ProductLength images",
        );
      const result = await syncOrderToIthink({ order, orderItems });
      return {
        pushed: true,
        awb_number: result.awb_number,
        tracking_url: result.tracking_url,
        label_url: result.label_url,
      };
    } else {
      if (!awb_number) {
        return sendResponse(res, false, null, "AWB number required");
      }
      tracking_url = getTrackingUrl(partner, awb_number);
    }
    order.courier = {
      partner,
      name: safeString(req.body.courier_name) || partner,
      awb_number,
      tracking_url,
      pickup_date: req.body.pickup_date
        ? new Date(req.body.pickup_date)
        : undefined,
    };
    order.status = "ready_to_ship";
    pushHistory(
      order,
      "ready_to_ship",
      req.user?.name || "admin",
      `Courier: ${partner}, AWB: ${awb_number}`,
    );
    await order.save();
    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendCourierAssigned(order, email, name, emailItems);
    sendAdminCourierAssigned(order, name, email, emailItems);
    sendResponse(res, true, order, "Courier assigned");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
// ═══════════════════════════════════════════════════════════════════════════════
// 9. SHIP ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");
    if (!["ready_to_ship", "packed"].includes(order.status))
      return sendResponse(
        res,
        false,
        null,
        "Order must be packed or ready_to_ship",
      );
    order.status = "shipped";
    if (order.courier) order.courier.dispatched_at = new Date();
    pushHistory(order, "shipped", req.user?.name || "admin", "Order shipped");
    await order.save();
    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderShipped(order, email, name, emailItems);
    sendAdminOrderShipped(order, name, email, emailItems);
    sendResponse(res, true, order, "Order shipped");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. UPDATE TRACKING
// ═══════════════════════════════════════════════════════════════════════════════
const updateTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");
    const tracking_url = safeString(req.body.tracking_url);
    const note = safeString(req.body.note);
    if (tracking_url) {
      try {
        const parsed = new URL(tracking_url);
        if (
          order.courier &&
          (parsed.protocol === "http:" || parsed.protocol === "https:")
        ) {
          order.courier.tracking_url = tracking_url;
        }
      } catch (_) {}
    }
    order.status = "in_transit";
    pushHistory(
      order,
      "in_transit",
      req.user?.name || "admin",
      note || "Tracking updated",
    );
    await order.save();
    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendTrackingUpdated(order, email, name, note, emailItems);
    sendAdminTrackingUpdated(order, name, note, emailItems);
    sendResponse(res, true, order, "Tracking updated");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. MARK DELIVERED
// ═══════════════════════════════════════════════════════════════════════════════
const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    order.status = "completed";
    if (order.courier) order.courier.delivered_at = new Date();
    pushHistory(
      order,
      "completed",
      req.user?.name || "admin",
      "Delivered to customer",
    );
    await order.save();

    try {
      const buyer = await User.findById(order.user_id?._id || order.user_id);
      if (buyer?.referredBy) {
        const completedCount = await Order.countDocuments({
          user_id: buyer._id,
          status: "completed",
        });
        if (completedCount === 1) {
          const referrer = await User.findById(buyer.referredBy);
          if (referrer) {
            const Reffrel = require("../models/reffrel");
            let settings = await Reffrel.findOne({ key: "referral" });
            if (!settings) settings = await Reffrel.create({ key: "referral" });

            const referrerPoints = settings.referrerPoints || 100;
            const refereePoints = settings.refereePoints || 100;

            await walletService.creditWallet(
              referrer._id,
              referrerPoints,
              `Referral bonus — ${buyer.name} joined`,
              { refUserId: buyer._id, orderId: order._id },
            );
            await walletService.creditWallet(
              buyer._id,
              refereePoints,
              "Welcome bonus — your first order",
              { orderId: order._id },
            );
          }
        }
      }
    } catch (refErr) {
      console.error("Referral bonus error:", refErr.message);
    }
    // ─────────────────────────────────────────

    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderDelivered(order, email, name, emailItems);
    sendAdminOrderDelivered(order, name, email, emailItems);

    sendResponse(res, true, order, "Order marked as delivered");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. MARK RTO / RETURNED / REFUNDED
// ═══════════════════════════════════════════════════════════════════════════════
const markRTO = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    const type = safeString(req.body.type) || "rto";
    const reason = safeString(req.body.reason);

    const validTypes = ["rto", "returned", "refunded"];
    if (!validTypes.includes(type))
      return sendResponse(res, false, null, "Invalid type");

    order.status = type;
    if (reason) order.cancel_reason = reason;
    pushHistory(order, type, req.user?.name || "admin", reason);
    await order.save();

    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderRTO(order, email, name, type, reason, emailItems);
    sendAdminOrderRTO(order, name, type, reason, emailItems);

    sendResponse(res, true, order, `Order marked as ${type}`);
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 13. GENERATE INVOICE
// ═══════════════════════════════════════════════════════════════════════════════
const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    const items = await OrderItem.find({ order_id: order._id })
      .populate("product_id", "name")
      .populate("variant_id", "sku");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.order_number}.pdf`,
    );

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("TAX INVOICE", { align: "center" });
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fontSize(10).font("Helvetica");

    doc.font("Helvetica-Bold").text("Invoice No: ", { continued: true });
    doc.font("Helvetica").text(`INV-${order.order_number}`);

    doc.font("Helvetica-Bold").text("Date: ", { continued: true });
    doc
      .font("Helvetica")
      .text(`${new Date(order.createdAt).toLocaleDateString("en-IN")}`);

    doc.font("Helvetica-Bold").text("Order No: ", { continued: true });
    doc.font("Helvetica").text(`${order.order_number}`);

    doc.moveDown(2);

    doc.font("Helvetica-Bold").text("Bill To:");
    doc.font("Helvetica");
    const addr = order.shippingAddress;
    doc.text(
      `${order.user_id?.name || `${addr.firstName} ${addr.lastName}`.trim()}`,
    );
    doc.text(`${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`);
    doc.font("Helvetica-Bold").text("Mobile: ", { continued: true });
    doc.font("Helvetica").text(addr.phone);
    doc.moveDown(1.5);

    const colX = [40, 220, 310, 380, 465];
    const headerY = doc.y;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Item", colX[0], headerY);
    doc.text("SKU", colX[1], headerY);
    doc.text("Qty", colX[2], headerY);
    doc.text("Rate", colX[3], headerY);
    doc.text("Amount", colX[4], headerY);
    doc
      .moveTo(40, headerY + 15)
      .lineTo(555, headerY + 15)
      .stroke();
    doc.y = headerY + 25;

    doc.font("Helvetica").fontSize(10);
    items.forEach((item) => {
      const y = doc.y + 3;
      doc.text(item.product_id?.name || "Product name", colX[0], y, {
        width: 175,
      });
      doc.text(item.variant_id?.sku || item.product_id?.sku || "-", colX[1], y);
      doc.text(String(item.quantity), colX[2], y);
      doc.text(`${item.price_at_order}`, colX[3], y);
      doc.text(`${item.price_at_order * item.quantity}`, colX[4], y);
      doc.moveDown(1.2);
    });

    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Grand Total:", { align: "right" });
    doc.font("Helvetica").text(`${order.total_price}`, { align: "right" });

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(`Payment: ${order.payment_method} (${order.payment_status})`, {
        align: "right",
      });

    doc.end();

    await Order.findByIdAndUpdate(req.params.id, { invoice_generated: true });
  } catch (err) {
    if (!res.headersSent) sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 14. UPDATE ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const updateOrder = async (req, res) => {
  try {
    const { status, coupon_id } = req.body;

    const items = safeArray(req.body.items);

    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, false, null, "Order not found");

    const oldItems = await OrderItem.find({ order_id: order._id });
    for (const oldItem of oldItems) {
      const variant = await ProductVariant.findById(oldItem.variant_id);
      if (variant) {
        variant.stock_quantity += oldItem.quantity;
        await variant.save();
      }
    }

    await OrderItem.deleteMany({ order_id: order._id });

    let total_price = 0;
    const newOrderItems = [];

    for (const item of items) {
      const variant = await ProductVariant.findById(item.variant_id).populate(
        "product_id",
      );
      if (!variant) return sendResponse(res, false, null, "Variant not found");
      if (variant.stock_quantity < item.quantity)
        return sendResponse(
          res,
          false,
          null,
          `Not enough stock for ${variant.sku}`,
        );

      let price = variant.price;
      if (
        variant.offerprice &&
        variant.offerprice > 0 &&
        variant.offerprice < price
      ) {
        price = variant.offerprice;
      } else {
        const discount_id = variant.product_id.discount_id;
        if (discount_id) {
          const discount = await Discount.findById(discount_id);
          if (isDiscountValid(discount)) {
            if (discount.type === "percentage")
              price = price - (price * discount.value) / 100;
            else if (discount.type === "fixed") price = price - discount.value;
            if (price < 0) price = 0;
          }
        }
      }

      total_price += price * item.quantity;
      variant.stock_quantity -= item.quantity;
      await variant.save();

      newOrderItems.push({
        order_id: order._id,
        product_id: variant.product_id._id,
        variant_id: variant._id,
        quantity: item.quantity,
        price_at_order: price,
      });
    }

    await OrderItem.insertMany(newOrderItems);
    order.total_price = total_price;
    if (status) order.status = status;
    if (coupon_id) order.coupon_id = coupon_id;
    await order.save();

    sendResponse(res, true, order, "Order updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 15. UPDATE STATUS
// ═══════════════════════════════════════════════════════════════════════════════
const updateOrderStatus = async (req, res) => {
  try {
    const status = safeString(req.body.status);
    const validStatuses = [
      "pending",
      "processing",
      "packed",
      "ready_to_ship",
      "shipped",
      "in_transit",
      "completed",
      "cancelled",
      "rto",
      "returned",
      "refunded",
    ];
    if (!validStatuses.includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" },
    );
    if (!order) return sendResponse(res, false, null, "Order not found");
    sendResponse(res, true, order, "Order status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 16. DELETE ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return sendResponse(res, false, null, "Order not found");
    await OrderItem.deleteMany({ order_id: deletedOrder._id });
    sendResponse(res, true, null, "Order deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 17. BULK DELETE
// ═══════════════════════════════════════════════════════════════════════════════
const bulkDeleteOrders = async (req, res) => {
  try {
    const ids = safeArray(req.body.ids);
    if (!ids.length) return sendResponse(res, false, null, "No IDs provided");

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds.length)
      return sendResponse(res, false, null, "No valid IDs provided");

    const result = await Order.deleteMany({ _id: { $in: validIds } });
    await OrderItem.deleteMany({ order_id: { $in: validIds } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Orders deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

//----------------------
//    order traking
// ----------

const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    if (order.courier?.partner === "ithink" && order.courier?.awb_number) {
      try {
        const tracking = await trackIthinkAWB(order.courier.awb_number);
        const newStatus = mapIthinkStatus(tracking.current_status);

        if (newStatus && newStatus !== order.status) {
          const prevStatus = order.status;
          order.status = newStatus;
          order.courier.last_status = tracking.current_status;
          order.courier.last_updated = new Date();

          if (newStatus === "completed") {
            order.courier.delivered_at = new Date();
          }

          const lastH = order.status_history[order.status_history.length - 1];
          if (!lastH || lastH.status !== newStatus) {
            order.status_history.push({
              status: newStatus,
              changed_by: "ithink-tracking",
              note:
                tracking.current_status +
                (tracking.last_scan_details?.scan_location
                  ? " — " + tracking.last_scan_details.scan_location
                  : ""),
              changed_at: new Date(),
            });
          }
          await order.save();
        }

        return sendResponse(res, true, {
          order,
          live_tracking: {
            current_status: tracking.current_status,
            expected_delivery_date: tracking.expected_delivery_date || null,
            last_scan: tracking.last_scan_details || null,
            scan_history: (tracking.scan_details || []).map((s) => ({
              status: s.status,
              location: s.scan_location,
              datetime: s.scan_date_time,
              remark: s.remark,
            })),
          },
        });
      } catch (trackErr) {
        return sendResponse(res, true, { order, live_tracking: null });
      }
    }

    return sendResponse(res, true, { order, live_tracking: null });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const addTrackingAWB = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    const awb_number = safeString(req.body.awb_number);
    if (!awb_number)
      return sendResponse(res, false, null, "AWB number required");

    order.courier = {
      partner: "ithink",
      name: safeString(req.body.courier_name) || "iThink",
      awb_number,
      tracking_url: `https://my.ithinklogistics.com/tracking/${awb_number}`,
      last_status: "Manifested",
      last_updated: new Date(),
    };
    order.status = "shipped";
    pushHistory(
      order,
      "shipped",
      req.user?.name || "admin",
      `AWB added: ${awb_number}`,
    );
    await order.save();

    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendOrderShipped(order, email, name, emailItems);
    sendAdminOrderShipped(order, name, email, emailItems);

    sendResponse(res, true, order, "AWB added, tracking started");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════
// REQUEST RETURN (by customer) — within 24hr of delivery
// ═══════════════════════════════════════════
const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    if (order.user_id?._id?.toString() !== req.user._id.toString()) {
      return sendResponse(res, false, null, "Forbidden: Not your order");
    }

    if (order.status !== "completed") {
      return sendResponse(
        res,
        false,
        null,
        "Only delivered orders can be returned",
      );
    }

    if (order.return_status !== "none") {
      return sendResponse(
        res,
        false,
        null,
        `Return already ${order.return_status} for this order`,
      );
    }

    const deliveredAt = order.courier?.delivered_at;
    if (!deliveredAt) {
      return sendResponse(res, false, null, "Delivery date not found");
    }

    const hoursSinceDelivered =
      (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceDelivered > 24) {
      return sendResponse(
        res,
        false,
        null,
        "Return window (24 hours after delivery) has expired",
      );
    }

    const { reason = "Return requested by customer" } = req.body;
    order.return_status = "requested";
    order.return_reason = safeString(reason);
    order.return_requested_at = new Date();
    pushHistory(
      order,
      "return_requested",
      req.user?.name || "customer",
      safeString(reason),
    );
    await order.save();

    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendReturnRequested(order, email, name, safeString(reason), emailItems);
    sendAdminReturnRequested(order, name, safeString(reason), emailItems);

    sendResponse(res, true, order, "Return request submitted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════
// APPROVE / REJECT RETURN (by admin)
// ═══════════════════════════════════════════
const decideReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    if (order.return_status !== "requested") {
      return sendResponse(
        res,
        false,
        null,
        "No pending return request for this order",
      );
    }

    const { decision, note = "" } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return sendResponse(res, false, null, "Invalid decision");
    }

    order.return_status = decision;
    order.return_decided_at = new Date();
    if (note) order.admin_note = safeString(note);

    if (decision === "approved") {
      order.status = "returned";
      pushHistory(
        order,
        "returned",
        req.user?.name || "admin",
        note || "Return approved — awaiting product pickup & refund",
      );

      const items = await OrderItem.find({ order_id: order._id });
      for (const item of items) {
        const variant = await ProductVariant.findById(item.variant_id);
        if (variant) {
          variant.stock_quantity += item.quantity;
          await variant.save();
        }
      }
    } else {
      pushHistory(
        order,
        "return_rejected",
        req.user?.name || "admin",
        note || "Return rejected",
      );
    }

    await order.save();

    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendReturnDecision(
      order,
      email,
      name,
      decision,
      safeString(note),
      emailItems,
    );
    sendAdminReturnDecision(
      order,
      name,
      decision,
      safeString(note),
      emailItems,
    );

    sendResponse(
      res,
      true,
      order,
      decision === "approved"
        ? "Return approved. Product restocked. Please refund the customer from the Refund button."
        : "Return request rejected",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════
// MANUAL REFUND TO WALLET (admin enters amount)
// ═══════════════════════════════════════════
const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    if (order.payment_status === "refunded") {
      return sendResponse(res, false, null, "This order is already refunded");
    }

    const { amount, note = "" } = req.body;
    const refundAmount = Number(amount);

    if (!refundAmount || refundAmount <= 0) {
      return sendResponse(res, false, null, "Enter a valid refund amount");
    }
    if (refundAmount > order.total_price) {
      return sendResponse(
        res,
        false,
        null,
        `Refund amount cannot exceed order total (₹${order.total_price})`,
      );
    }
    await walletService.creditWallet(
      order.user_id._id || order.user_id,
      refundAmount,
      `Refund for Order #${order.order_number}${note ? " — " + safeString(note) : ""}`,
      { orderId: order._id },
    );
    order.payment_status = "refunded";
    pushHistory(
      order,
      order.status,
      req.user?.name || "admin",
      `Refunded ₹${refundAmount} to wallet` +
        (note ? ` — ${safeString(note)}` : ""),
    );
    await order.save();
    const { email, name } = getCustomerInfo(order);
    const emailItems = await getEmailItems(order._id);
    sendRefundProcessed(
      order,
      email,
      name,
      refundAmount,
      safeString(note),
      emailItems,
    );
    sendAdminRefundProcessed(
      order,
      name,
      refundAmount,
      safeString(note),
      emailItems,
    );

    sendResponse(
      res,
      true,
      order,
      `₹${refundAmount} refunded to customer's wallet successfully`,
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════
// UPDATE SHIPPING ADDRESS + ITEM DIMENSIONS (admin edit)
// ═══════════════════════════════════════════════════════════
const pushOrderToIthink = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user_id",
      "name email",
    );
    if (!order) return sendResponse(res, false, null, "Order not found");

    if (order.courier?.awb_number) {
      return sendResponse(
        res,
        false,
        null,
        "AWB already assigned. Cannot push again.",
      );
    }

    if (
      !order.shipment_weight ||
      !order.shipment_length ||
      !order.shipment_width ||
      !order.shipment_height
    ) {
      return sendResponse(
        res,
        false,
        null,
        "Please fill weight/length/width/height before shipping to iThink",
      );
    }

    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate("product_id", "name")
      .populate("variant_id", "sku");

    await syncOrderToIthink({ order, orderItems });

    order.status = "processing";
    pushHistory(
      order,
      "processing",
      req.user?.name || "admin",
      "Order pushed to iThink dashboard",
    );
    await order.save();

    sendResponse(res, true, order, "Order pushed to iThink!");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateOrderShippingDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, false, null, "Order not found");
    const {
      shippingAddress,
      shipment_weight,
      shipment_length,
      shipment_width,
      shipment_height,
      awb_number,
      courier_name,
    } = req.body;

    if (shippingAddress) {
      order.shippingAddress = {
        ...(order.shippingAddress?.toObject?.() || order.shippingAddress || {}),
        ...shippingAddress,
      };
    }

    if (shipment_weight !== undefined)
      order.shipment_weight = Number(shipment_weight) || 0;
    if (shipment_length !== undefined)
      order.shipment_length = Number(shipment_length) || 0;
    if (shipment_width !== undefined)
      order.shipment_width = Number(shipment_width) || 0;
    if (shipment_height !== undefined)
      order.shipment_height = Number(shipment_height) || 0;

    if (awb_number !== undefined) {
      const cleanAwb = safeString(awb_number);
      if (cleanAwb) {
        order.courier = {
          partner: "ithink",
          name: safeString(courier_name) || "iThink",
          awb_number: cleanAwb,
          tracking_url: `https://my.ithinklogistics.com/tracking/${cleanAwb}`,
          last_status: "Manifested",
          last_updated: new Date(),
        };
        if (!["shipped", "in_transit", "completed"].includes(order.status)) {
          order.status = "shipped";
          pushHistory(
            order,
            "shipped",
            req.user?.name || "admin",
            `AWB added: ${cleanAwb}`,
          );
        }
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "user_id",
      "name email",
    );
    const updatedItems = await OrderItem.find({ order_id: order._id })
      .populate("product_id", "name")
      .populate("variant_id", "sku");

    sendResponse(
      res,
      true,
      { order: updatedOrder, items: updatedItems },
      "Shipping details updated successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getOrders,
  getPublicUserOrders,
  getOrderById,
  createOrder,
  saveNewOrder,
  activateOrder,
  updateOrder,
  deleteOrder,
  addTrackingAWB,
  bulkDeleteOrders,
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  packOrder,
  generatePackingSlip,
  assignCourier,
  shipOrder,
  updateTracking,
  markDelivered,
  markRTO,
  generateInvoice,
  getOrderTracking,
  requestReturn,
  decideReturn,
  updateOrderShippingDetails,
  pushOrderToIthink,
  refundOrder,
};

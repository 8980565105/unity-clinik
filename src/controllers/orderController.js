// const mongoose = require("mongoose");
// const Discount = require("../models/Discount");
// const Order = require("../models/Order");
// const OrderItem = require("../models/OrderItem");
// const Packing = require("../models/paking");
// const ProductVariant = require("../models/ProductVariant");
// const Product = require("../models/Product");
// const { sendResponse } = require("../utils/response");
// const PDFDocument = require("pdfkit");
// const QRCode = require("qrcode");
// const bwipjs = require("bwip-js");
// const {
//   sendOrderPlaced,
//   sendOrderConfirmed,
//   sendOrderPacked,
//   sendCourierAssigned,
//   sendOrderShipped,
//   sendTrackingUpdated,
//   sendOrderDelivered,
//   sendOrderCancelled,
//   sendOrderRTO,
//   sendAdminNewOrder,
//   sendAdminOrderConfirmed,
//   sendAdminOrderPacked,
//   sendAdminCourierAssigned,
//   sendAdminOrderShipped,
//   sendAdminTrackingUpdated,
//   sendAdminOrderDelivered,
//   sendAdminOrderCancelled,
//   sendAdminOrderRTO,
// } = require("../utils/orderEmailService");

// const getCustomerInfo = (order) => {
//   const email = order.user_id?.email || null;
//   const name =
//     order.user_id?.name ||
//     `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
//     "Customer";
//   return { email, name };
// };

// const pushHistory = (order, status, changedBy = "admin", note = "") => {
//   order.status_history.push({ status, changed_by: changedBy, note });
// };

// const getTrackingUrl = (partner, awb) => {
//   const urls = {
//     Delhivery: `https://www.delhivery.com/track/package/${awb}`,
//     "Blue Dart": `https://www.bluedart.com/web/guest/trackdartcount?Param=WayBill&Val=${awb}`,
//     DTDC: `https://www.dtdc.in/tracking.asp?txconsignno=${awb}`,
//     Shiprocket: `https://shiprocket.co/tracking/${awb}`,
//   };
//   return urls[partner] || "";
// };

// const isDiscountValid = (discount) => {
//   const now = new Date();
//   return (
//     discount &&
//     discount.status === "active" &&
//     discount.start_date <= now &&
//     discount.end_date >= now
//   );
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 1. GET ALL ORDERS  — admin & store_owner only (authenticated)
// // ═══════════════════════════════════════════════════════════════════════════════
// const getOrders = async (req, res) => {
//   try {
//     let {
//       page = 1,
//       limit = 10,
//       search = "",
//       isDownload = "false",
//       status,
//       user,
//       product,
//       color,
//       size,
//       startDate,
//       endDate,
//       minPrice,
//       maxPrice,
//     } = req.query;

//     page = parseInt(page);
//     limit = parseInt(limit);
//     const download = isDownload.toLowerCase() === "true";

//     const role = req.user?.role;

//     if (role === "store_user") {
//       return sendResponse(
//         res,
//         false,
//         null,
//         "Forbidden: Use /orders/public instead",
//       );
//     }

//     const orderMatch = {};

//     if (search) {
//       orderMatch.$or = [
//         { status: { $regex: search, $options: "i" } },
//         { order_number: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (
//       status &&
//       [
//         "pending",
//         "processing",
//         "packed",
//         "ready_to_ship",
//         "shipped",
//         "in_transit",
//         "completed",
//         "cancelled",
//         "rto",
//         "returned",
//         "refunded",
//       ].includes(status)
//     ) {
//       orderMatch.status = status;
//     }

//     if (user && role === "admin") {
//       const userString = typeof user === "string" ? user : String(user);
//       const userArray = userString
//         .split(",")
//         .map((id) => new mongoose.Types.ObjectId(id));
//       orderMatch.user_id = { $in: userArray };
//     }

//     if (startDate || endDate) {
//       orderMatch.createdAt = {};
//       if (startDate) orderMatch.createdAt.$gte = new Date(startDate);
//       if (endDate) orderMatch.createdAt.$lte = new Date(endDate);
//     }

//     if (minPrice || maxPrice) {
//       orderMatch.total_price = {};
//       if (minPrice) orderMatch.total_price.$gte = Number(minPrice);
//       if (maxPrice) orderMatch.total_price.$lte = Number(maxPrice);
//     }

//     const itemMatch = {};
//     if (product) {
//       const productArray = product

//       .split(",")
//         .map((id) => new mongoose.Types.ObjectId(id));
//       itemMatch.product_id = { $in: productArray };
//     }
//     if (color) {
//       const colorArray = color
//         .split(",")
//         .map((id) => new mongoose.Types.ObjectId(id));
//       itemMatch["variant_id.color_id"] = { $in: colorArray };
//     }
//     if (size) {
//       const sizeArray = size
//         .split(",")
//         .map((id) => new mongoose.Types.ObjectId(id));
//       itemMatch["variant_id.size_id"] = { $in: sizeArray };
//     }

//     if (role === "store_owner") {
//       const ownerProducts = await Product.find(
//         { createdBy: req.user._id },
//         { _id: 1 },
//       );
//       const ownerProductIds = ownerProducts.map((p) => p._id);

//       if (ownerProductIds.length === 0) {
//         return sendResponse(res, true, {
//           orders: [],
//           total: 0,
//           page,
//           pages: 0,
//         });
//       }

//       const ownerOrderItems = await OrderItem.find(
//         { product_id: { $in: ownerProductIds } },
//         { order_id: 1 },
//       );
//       const ownerOrderIds = [
//         ...new Set(ownerOrderItems.map((oi) => oi.order_id.toString())),
//       ].map((id) => new mongoose.Types.ObjectId(id));

//       if (ownerOrderIds.length === 0) {
//         return sendResponse(res, true, {
//           orders: [],
//           total: 0,
//           page,
//           pages: 0,
//         });
//       }

//       orderMatch._id = { $in: ownerOrderIds };
//     }

//     const pipeline = [
//       { $match: orderMatch },
//       {
//         $lookup: {
//           from: "orderitems",
//           localField: "_id",
//           foreignField: "order_id",
//           as: "items",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "products",
//                 localField: "product_id",
//                 foreignField: "_id",
//                 as: "product",
//               },
//             },
//             {
//               $lookup: {
//                 from: "productvariants",
//                 localField: "variant_id",
//                 foreignField: "_id",
//                 as: "variant",
//                 pipeline: [
//                   {
//                     $lookup: {
//                       from: "colors",
//                       localField: "color_id",
//                       foreignField: "_id",
//                       as: "color",
//                     },
//                   },
//                   {
//                     $lookup: {
//                       from: "sizes",
//                       localField: "size_id",
//                       foreignField: "_id",
//                       as: "size",
//                     },
//                   },
//                 ],
//               },
//             },
//             { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
//             { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },
//             { $match: Object.keys(itemMatch).length ? itemMatch : {} },
//           ],
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user_id",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
//       { $sort: { createdAt: -1 } },
//     ];

//     if (!download) {
//       pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
//     }

//     const orders = await Order.aggregate(pipeline);
//     const totalCountAgg = await Order.aggregate([
//       { $match: orderMatch },
//       { $count: "total" },
//     ]);
//     const total = totalCountAgg[0]?.total || 0;

//     sendResponse(res, true, {
//       orders,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 1B. GET PUBLIC USER ORDERS — store_user only sees their OWN orders
// //     Route: GET /orders/public  (authMiddleware applied in routes)
// // ═══════════════════════════════════════════════════════════════════════════════
// const getPublicUserOrders = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     if (!userId) {
//       return sendResponse(res, false, null, "Unauthorized");
//     }

//     let { page = 1, limit = 5, search = "" } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const orderMatch = {
//       user_id: new mongoose.Types.ObjectId(userId),
//     };

//     if (search) {
//       orderMatch.$and = [
//         { user_id: new mongoose.Types.ObjectId(userId) },
//         {
//           $or: [
//             { status: { $regex: search, $options: "i" } },
//             { order_number: { $regex: search, $options: "i" } },
//           ],
//         },
//       ];
//       delete orderMatch.user_id;
//     }

//     const pipeline = [
//       { $match: orderMatch },
//       {
//         $lookup: {
//           from: "orderitems",
//           localField: "_id",
//           foreignField: "order_id",
//           as: "items",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "products",
//                 localField: "product_id",
//                 foreignField: "_id",
//                 as: "product",
//               },
//             },
//             {
//               $lookup: {
//                 from: "productvariants",
//                 localField: "variant_id",
//                 foreignField: "_id",
//                 as: "variant",
//                 pipeline: [
//                   {
//                     $lookup: {
//                       from: "colors",
//                       localField: "color_id",
//                       foreignField: "_id",
//                       as: "color",
//                     },
//                   },
//                   {
//                     $lookup: {
//                       from: "sizes",
//                       localField: "size_id",
//                       foreignField: "_id",
//                       as: "size",
//                     },
//                   },
//                 ],
//               },
//             },
//             { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
//             { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },
//           ],
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       { $skip: (page - 1) * limit },
//       { $limit: limit },
//     ];

//     const orders = await Order.aggregate(pipeline);

//     const totalCountAgg = await Order.aggregate([
//       { $match: orderMatch },
//       { $count: "total" },
//     ]);
//     const total = totalCountAgg[0]?.total || 0;

//     sendResponse(res, true, {
//       orders,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 2. GET ORDER BY ID  — role check
// // ═══════════════════════════════════════════════════════════════════════════════
// const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate("user_id", "name email")
//       .populate("coupon_id", "code discount_value")
//       .populate("packing_id");

//     if (!order) return sendResponse(res, false, null, "Order not found");

//     if (
//       req.user?.role === "store_user" &&
//       order.user_id?._id?.toString() !== req.user._id.toString()
//     ) {
//       return sendResponse(res, false, null, "Forbidden: Not your order");
//     }

//     if (req.user?.role === "store_owner") {
//       const ownerProducts = await Product.find(
//         { createdBy: req.user._id },
//         { _id: 1 },
//       );
//       const ownerProductIds = ownerProducts.map((p) => p._id.toString());
//       const items = await OrderItem.find(
//         { order_id: order._id },
//         { product_id: 1 },
//       );
//       const hasOwnerProduct = items.some((item) =>
//         ownerProductIds.includes(item.product_id.toString()),
//       );
//       if (!hasOwnerProduct) {
//         return sendResponse(res, false, null, "Forbidden: Not your order");
//       }
//     }

//     const items = await OrderItem.find({ order_id: order._id })
//       .populate("product_id", "name price sku")
//       .populate({
//         path: "variant_id",
//         populate: [
//           { path: "color_id", select: "name" },
//           { path: "size_id", select: "name" },
//         ],
//       });

//     sendResponse(res, true, { order, items }, "Order retrieved successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 3. CREATE ORDER
// // ═══════════════════════════════════════════════════════════════════════════════
// const createOrder = async (req, res) => {
//   try {
//     const {
//       user_id,
//       items,
//       coupon_id,
//       shippingAddress,
//       payment_method = "COD",
//       transaction_id,
//     } = req.body;

//     if (!items || !items.length) {
//       return sendResponse(res, false, null, "No items provided");
//     }

//     let total_price = 0;
//     const orderItems = [];
//     let store_owner_id = null;

//     for (const item of items) {
//       const variant = await ProductVariant.findById(item.variant_id).populate(
//         "product_id",
//       );
//       if (!variant) return sendResponse(res, false, null, "Variant not found");
//       if (variant.stock_quantity < item.quantity)
//         return sendResponse(
//           res,
//           false,
//           null,
//           `Not enough stock for ${variant.sku}`,
//         );

//       if (!store_owner_id && variant.product_id?.createdBy) {
//         store_owner_id =
//           variant.product_id.createdBy._id || variant.product_id.createdBy;
//       }

//       let price = variant.price;
//       const discount_id = variant.product_id.discount_id;
//       if (discount_id) {
//         const discount = await Discount.findById(discount_id);
//         if (isDiscountValid(discount)) {
//           if (discount.type === "percentage")
//             price = price - (price * discount.value) / 100;
//           else if (discount.type === "fixed") price = price - discount.value;
//           if (price < 0) price = 0;
//         }
//       }

//       total_price += price * item.quantity;
//       variant.stock_quantity -= item.quantity;
//       await variant.save();

//       orderItems.push({
//         order_id: null,
//         product_id: variant.product_id._id,
//         variant_id: variant._id,
//         quantity: item.quantity,
//         price_at_order: price,
//       });
//     }

//     const order = new Order({
//       user_id,
//       total_price,
//       coupon_id: coupon_id || null,
//       shippingAddress,
//       payment_method,
//       payment_status:
//         payment_method === "Online" && transaction_id ? "paid" : "pending",
//       transaction_id: transaction_id || "",
//       status: "pending",
//       store_owner_id: store_owner_id || null,
//     });

//     pushHistory(order, "pending", "customer", "Order placed");
//     const savedOrder = await order.save();

//     orderItems.forEach((oi) => (oi.order_id = savedOrder._id));
//     await OrderItem.insertMany(orderItems);

//     const populatedForEmail = await Order.findById(savedOrder._id).populate(
//       "user_id",
//       "name email",
//     );
//     const { email: placedEmail, name: placedName } = getCustomerInfo(
//       populatedForEmail || savedOrder,
//     );
//     sendOrderPlaced(populatedForEmail || savedOrder, placedEmail, placedName);
//     sendAdminNewOrder(populatedForEmail || savedOrder, placedName, placedEmail);
//     sendResponse(res, true, savedOrder, "Order created successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 4. CONFIRM ORDER → creates Packing record automatically
// // ═══════════════════════════════════════════════════════════════════════════════
// const confirmOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");
//     if (order.status !== "pending")
//       return sendResponse(
//         res,
//         false,
//         null,
//         `Order is already '${order.status}'`,
//       );

//     const items = await OrderItem.find({ order_id: order._id }).populate(
//       "product_id",
//       "name sku weight",
//     );

//     const packingItems = items.map((item) => ({
//       product_id: item.product_id?._id,
//       name: item.product_id?.name || "Product",
//       sku: item.product_id?.sku || "",
//       quantity: item.quantity,
//       price: item.price_at_order,
//       weight: item.product_id?.weight || 0,
//     }));

//     const totalWeight = packingItems.reduce(
//       (sum, i) => sum + i.weight * i.quantity,
//       0,
//     );

//     const packing = new Packing({
//       order_id: order._id,
//       order_number: order.order_number,
//       customer: {
//         name:
//           order.user_id?.name ||
//           `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim(),
//         mobile: order.shippingAddress?.phone || "",
//         email: order.user_id?.email || "",
//       },
//       shippingAddress: order.shippingAddress,
//       items: packingItems,
//       total_amount: order.total_price,
//       total_weight: totalWeight,
//       cod_amount: order.payment_method === "COD" ? order.total_price : 0,
//       packed_by: req.user?.name || "admin",
//     });

//     await packing.save();

//     order.status = "processing";
//     order.packing_id = packing._id;
//     if (req.body.admin_note) order.admin_note = req.body.admin_note;
//     pushHistory(
//       order,
//       "processing",
//       req.user?.name || "admin",
//       req.body.admin_note || "",
//     );
//     await order.save();

//     const { email, name } = getCustomerInfo(order);
//     sendOrderConfirmed(order, email, name);
//     sendAdminOrderConfirmed(order, name, email);

//     sendResponse(res, true, { order, packing }, "Order confirmed");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 5. CANCEL ORDER
// // ═══════════════════════════════════════════════════════════════════════════════
// const cancelOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     if (
//       req.user?.role === "store_user" &&
//       order.user_id?._id?.toString() !== req.user._id.toString()
//     ) {
//       return sendResponse(res, false, null, "Forbidden: Not your order");
//     }

//     if (["cancelled", "completed", "refunded"].includes(order.status)) {
//       return sendResponse(
//         res,
//         false,
//         null,
//         `Cannot cancel order with status '${order.status}'`,
//       );
//     }

//     const { reason = "Cancelled by customer" } = req.body;
//     order.status = "cancelled";
//     order.cancel_reason = reason;
//     pushHistory(order, "cancelled", req.user?.name || "customer", reason);
//     await order.save();

//     const items = await OrderItem.find({ order_id: order._id });
//     for (const item of items) {
//       const variant = await ProductVariant.findById(item.variant_id);
//       if (variant) {
//         variant.stock_quantity += item.quantity;
//         await variant.save();
//       }
//     }

//     const { email, name } = getCustomerInfo(order);
//     sendOrderCancelled(order, email, name);
//     sendAdminOrderCancelled(order, name, email);

//     sendResponse(res, true, order, "Order cancelled");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 6. PACK ORDER
// // ═══════════════════════════════════════════════════════════════════════════════
// const packOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");
//     if (order.status !== "processing")
//       return sendResponse(
//         res,
//         false,
//         null,
//         "Order must be in processing state to pack",
//       );

//     const { warehouse_name } = req.body;
//     order.status = "packed";
//     pushHistory(
//       order,
//       "packed",
//       req.user?.name || "admin",
//       `Packed at ${warehouse_name || "warehouse"}`,
//     );
//     await order.save();

//     if (order.packing_id) {
//       await Packing.findByIdAndUpdate(order.packing_id, {
//         status: "packed",
//         warehouse_name: warehouse_name || "",
//         packed_at: new Date(),
//       });
//     }

//     const packing = order.packing_id
//       ? await Packing.findById(order.packing_id)
//       : null;

//     const { email, name } = getCustomerInfo(order);
//     sendOrderPacked(order, email, name);
//     sendAdminOrderPacked(order, name, email);

//     sendResponse(res, true, { order, packing }, "Order packed");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const generatePackingSlip = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) return sendResponse(res, false, null, "Order not found");
//     if (!order.packing_id)
//       return sendResponse(
//         res,
//         false,
//         null,
//         "No packing record found for this order",
//       );

//     const packing = await Packing.findById(order.packing_id);
//     if (!packing) return sendResponse(res, false, null, "Packing not found");

//     const liveItems = await OrderItem.find({ order_id: order._id })
//       .populate("product_id", "name")
//       .populate("variant_id", "sku");
//     const itemInfoMap = {};
//     liveItems.forEach((li) => {
//       const pid = li.product_id?._id?.toString();
//       if (pid) {
//         itemInfoMap[pid] = {
//           name: li.product_id?.name || "",
//           sku: li.variant_id?.sku || "",
//         };
//       }
//     });

//     const resolvedItems = packing.items.map((item) => {
//       const pid = item.product_id?.toString();
//       const live = pid ? itemInfoMap[pid] : null;
//       return {
//         ...(item.toObject ? item.toObject() : item),
//         name: live?.name || item.name || "—",
//         sku: live?.sku || item.sku || "—",
//       };
//     });

//     const qrData = [
//       `Order: ${packing.order_number}`,
//       `ID: ${order._id}`,
//       `Customer: ${packing.customer?.name || ""}`,
//       `Total: Rs.${packing.total_amount}`,
//       packing.cod_amount > 0
//         ? `COD: Rs.${packing.cod_amount}`
//         : "Payment: Online",
//       order.courier?.awb_number ? `AWB: ${order.courier.awb_number}` : "",
//     ]
//       .filter(Boolean)
//       .join("\n");

//     const qrBuffer = await QRCode.toBuffer(qrData, {
//       errorCorrectionLevel: "M",
//       width: 120,
//       margin: 1,
//       color: { dark: "#1e3a5f", light: "#ffffff" },
//     });

//     const barcodeBuffer = await bwipjs.toBuffer({
//       bcid: "code128",
//       text: packing.order_number,
//       scale: 2,
//       height: 10,
//       includetext: true,
//       textxalign: "center",
//       textfont: "Helvetica",
//       textsize: 8,
//       paddingwidth: 4,
//       paddingheight: 2,
//       backgroundcolor: "ffffff",
//       barcolor: "1e3a5f",
//     });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=slip-${order.order_number}.pdf`,
//     );

//     const doc = new PDFDocument({ margin: 30, size: "A5", layout: "portrait" });
//     doc.pipe(res);

//     const PW = doc.page.width;
//     const L = 30;
//     const R = PW - 30;
//     const W = R - L;

//     doc.rect(L, 20, W, 28).fill("#1e3a5f");
//     doc
//       .fillColor("white")
//       .font("Helvetica-Bold")
//       .fontSize(14)
//       .text("PACKING SLIP", L, 27, { width: W, align: "center" });
//     doc.fillColor("black");

//     let y = 60;

//     const INFO_H = 92;
//     const col1W = W * 0.5;
//     const col2X = L + col1W + 8;
//     const col2W = W - col1W - 8;

//     doc.rect(L, y, col1W, INFO_H).stroke("#cccccc");
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(7)
//       .fillColor("#555555")
//       .text("ORDER INFORMATION", L + 5, y + 5);
//     doc.fillColor("#000000");

//     const oi = [
//       ["Order No", packing.order_number],
//       ["Order ID", order._id.toString()],
//       ["Date", new Date(order.createdAt).toLocaleDateString("en-IN")],
//       [
//         "Payment",
//         order.payment_method === "COD"
//           ? `COD ${packing.cod_amount}`
//           : "Online Paid",
//       ],
//       ["Warehouse", packing.warehouse_name || "\u2014"],
//     ];

//     let oiy = y + 17;
//     oi.forEach(([label, val]) => {
//       const isId = label === "Order ID";
//       doc
//         .font("Helvetica-Bold")
//         .fontSize(isId ? 6 : 7.5)
//         .text(`${label}:`, L + 5, oiy, { continued: true })
//         .font("Helvetica")
//         .fontSize(isId ? 6 : 7.5)
//         .text(` ${val}`, { lineBreak: false });
//       oiy += isId ? 11 : 13;
//     });

//     doc.rect(col2X, y, col2W, INFO_H).stroke("#cccccc");
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(7)
//       .fillColor("#555555")
//       .text("SHIP TO", col2X + 5, y + 5);
//     doc.fillColor("#000000");

//     const addr = packing.shippingAddress || {};
//     const shipName =
//       packing.customer?.name ||
//       `${addr.firstName || ""} ${addr.lastName || ""}`.trim() ||
//       "Customer";

//     let sy = y + 17;
//     const shipBoxW = col2W - 10;

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(8)
//       .text(shipName, col2X + 5, sy, { width: shipBoxW, lineBreak: false });
//     sy += 12;

//     if (addr.address) {
//       doc
//         .font("Helvetica")
//         .fontSize(7.5)
//         .text(addr.address, col2X + 5, sy, { width: shipBoxW });
//       sy += Math.max(doc.heightOfString(addr.address, { width: shipBoxW }), 11);
//     }

//     const cityLine = [
//       addr.city,
//       addr.state,
//       addr.pincode ? `\u2014 ${addr.pincode}` : "",
//     ]
//       .filter(Boolean)
//       .join(", ");
//     if (cityLine) {
//       doc
//         .font("Helvetica")
//         .fontSize(7.5)
//         .text(cityLine, col2X + 5, sy, { width: shipBoxW, lineBreak: false });
//       sy += 11;
//     }

//     const phone = addr.phone || packing.customer?.mobile || "\u2014";
//     doc
//       .font("Helvetica")
//       .fontSize(7.5)
//       .text(`Ph: ${phone}`, col2X + 5, sy, {
//         width: shipBoxW,
//         lineBreak: false,
//       });

//     y += INFO_H + 8;

//     const barcodeW = W * 0.65;
//     const barcodeH = 40;
//     const barcodeX = L + (W - barcodeW) / 2;
//     doc.image(barcodeBuffer, barcodeX, y, {
//       width: barcodeW,
//       height: barcodeH,
//     });
//     y += barcodeH + 6;

//     const cols = [
//       { x: L, w: W * 0.36, label: "Product", align: "left" },
//       { x: L + W * 0.36, w: W * 0.15, label: "SKU", align: "left" },
//       { x: L + W * 0.51, w: W * 0.09, label: "Qty", align: "center" },
//       { x: L + W * 0.6, w: W * 0.18, label: "Price", align: "right" },
//       { x: L + W * 0.78, w: W * 0.22, label: "Total", align: "center" },
//     ];

//     const TH = 16;
//     doc.rect(L, y, W, TH).fill("#1e3a5f");
//     doc.fillColor("white").font("Helvetica-Bold").fontSize(7.5);
//     cols.forEach((c) => {
//       doc.text(c.label, c.x + 3, y + 4, {
//         width: c.w - 6,
//         align: c.align,
//         lineBreak: false,
//       });
//     });
//     doc.fillColor("black");
//     const tableStartY = y;
//     y += TH;

//     doc.font("Helvetica").fontSize(7.5);
//     let totalQty = 0;

//     resolvedItems.forEach((item, rowIndex) => {
//       const rowH = 16;
//       if (rowIndex % 2 === 0) {
//         doc.rect(L, y, W, rowH).fill("#f5f7fa");
//       }
//       doc.fillColor("#000000");
//       doc.text(item.name || "\u2014", cols[0].x + 3, y + 4, {
//         width: cols[0].w - 6,
//         align: "left",
//         lineBreak: false,
//       });
//       doc.text(item.sku, cols[1].x + 3, y + 4, {
//         width: cols[1].w - 6,
//         align: "left",
//         lineBreak: false,
//       });
//       doc.text(String(item.quantity), cols[2].x + 3, y + 4, {
//         width: cols[2].w - 6,
//         align: "center",
//         lineBreak: false,
//       });
//       doc.text(
//         `${Number(item.price).toLocaleString("en-IN")}`,
//         cols[3].x + 3,
//         y + 4,
//         { width: cols[3].w - 6, align: "center", lineBreak: false },
//       );
//       doc.text(
//         `${(Number(item.price) * item.quantity).toLocaleString("en-IN")}`,
//         cols[4].x + 3,
//         y + 4,
//         { width: cols[4].w - 6, align: "center", lineBreak: false },
//       );
//       totalQty += item.quantity;
//       y += rowH;
//     });

//     doc
//       .rect(L, tableStartY, W, TH + resolvedItems.length * 16)
//       .stroke("#cccccc");

//     y += 8;
//     doc.moveTo(L, y).lineTo(R, y).stroke("#cccccc");
//     y += 8;

//     const QR_SIZE = 72;
//     const qrX = R - QR_SIZE;
//     const sumX = L;
//     const sumW = W - QR_SIZE - 10;
//     const summaryStartY = y;

//     const summaryRows = [
//       ["Total Items", String(totalQty)],
//       ["Total Weight", `${packing.total_weight || 0}g`],
//     ];

//     summaryRows.forEach(([label, val]) => {
//       doc
//         .font("Helvetica")
//         .fontSize(8)
//         .text(label, sumX, y, {
//           width: sumW * 0.55,
//           align: "left",
//           lineBreak: false,
//         });
//       doc.text(val, sumX + sumW * 0.55, y, {
//         width: sumW * 0.45,
//         align: "right",
//         lineBreak: false,
//       });
//       y += 12;
//     });

//     y += 4;

//     doc
//       .font("Helvetica-Bold")
//       .fontSize(10)
//       .fillColor("#1e3a5f")
//       .text("Grand Total", sumX, y, {
//         width: sumW * 0.55,
//         align: "left",
//         lineBreak: false,
//       });
//     doc.text(
//       `${Number(packing.total_amount).toLocaleString("en-IN")}`,
//       sumX + sumW * 0.55,
//       y,
//       { width: sumW * 0.45, align: "right", lineBreak: false },
//     );
//     doc.fillColor("black");
//     y += 14;

//     doc.image(qrBuffer, qrX, summaryStartY, {
//       width: QR_SIZE,
//       height: QR_SIZE,
//     });
//     doc
//       .font("Helvetica")
//       .fontSize(6)
//       .fillColor("#888888")
//       .text("Scan to verify order", qrX, summaryStartY + QR_SIZE + 2, {
//         width: QR_SIZE,
//         align: "center",
//       });
//     doc.fillColor("black");

//     y = Math.max(y, summaryStartY + QR_SIZE + 14);

//     if (order.payment_method === "COD") {
//       y += 4;
//       doc.rect(L, y, W, 22).fill("#fff3cd").stroke("#ffc107");
//       doc
//         .font("Helvetica-Bold")
//         .fontSize(10)
//         .fillColor("#7d4e00")
//         .text(
//           `COD COLLECTION: ${Number(packing.cod_amount).toLocaleString("en-IN")}`,
//           L + 5,
//           y + 6,
//           { width: W - 10, align: "center" },
//         );
//       doc.fillColor("black");
//       y += 30;
//     }

//     y += 8;
//     doc.moveTo(L, y).lineTo(R, y).stroke("#cccccc");
//     y += 6;
//     doc
//       .font("Helvetica")
//       .fontSize(7.5)
//       .fillColor("#666666")
//       .text("Thank you for shopping with us!", L, y, {
//         width: W,
//         align: "center",
//       });

//     doc.end();

//     await Packing.findByIdAndUpdate(order.packing_id, { slip_generated: true });
//   } catch (err) {
//     if (!res.headersSent) sendResponse(res, false, null, err.message);
//   }
// };
// // ═══════════════════════════════════════════════════════════════════════════════
// // 8. ASSIGN COURIER
// // ═══════════════════════════════════════════════════════════════════════════════
// const assignCourier = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     const { partner, courier_name, awb_number, pickup_date } = req.body;

//     order.courier = {
//       partner: partner || "",
//       name: courier_name || "",
//       awb_number: awb_number || "",
//       tracking_url: getTrackingUrl(partner, awb_number),
//       pickup_date: pickup_date ? new Date(pickup_date) : undefined,
//     };
//     order.status = "ready_to_ship";
//     pushHistory(
//       order,
//       "ready_to_ship",
//       req.user?.name || "admin",
//       `Courier: ${partner}, AWB: ${awb_number}`,
//     );
//     await order.save();

//     const { email, name } = getCustomerInfo(order);
//     sendCourierAssigned(order, email, name);
//     sendAdminCourierAssigned(order, name, email);

//     sendResponse(res, true, order, "Courier assigned");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 9. SHIP ORDER
// // ═══════════════════════════════════════════════════════════════════════════════
// const shipOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");
//     if (!["ready_to_ship", "packed"].includes(order.status))
//       return sendResponse(
//         res,
//         false,
//         null,
//         "Order must be packed or ready_to_ship",
//       );

//     order.status = "shipped";
//     if (order.courier) order.courier.dispatched_at = new Date();
//     pushHistory(order, "shipped", req.user?.name || "admin", "Order shipped");
//     await order.save();

//     const { email, name } = getCustomerInfo(order);
//     sendOrderShipped(order, email, name);
//     sendAdminOrderShipped(order, name, email);

//     sendResponse(res, true, order, "Order shipped");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 10. UPDATE TRACKING
// // ═══════════════════════════════════════════════════════════════════════════════
// const updateTracking = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     const { tracking_url, note } = req.body;
//     if (tracking_url && order.courier)
//       order.courier.tracking_url = tracking_url;
//     order.status = "in_transit";
//     pushHistory(
//       order,
//       "in_transit",
//       req.user?.name || "admin",
//       note || "Tracking updated",
//     );
//     await order.save();

//     const { email, name } = getCustomerInfo(order);
//     sendTrackingUpdated(order, email, name);
//     sendAdminTrackingUpdated(order, name, email);

//     sendResponse(res, true, order, "Tracking updated");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 11. MARK DELIVERED
// // ═══════════════════════════════════════════════════════════════════════════════
// const markDelivered = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     order.status = "completed";
//     if (order.courier) order.courier.delivered_at = new Date();
//     pushHistory(
//       order,
//       "completed",
//       req.user?.name || "admin",
//       "Delivered to customer",
//     );
//     await order.save();

//     const { email, name } = getCustomerInfo(order);
//     sendOrderDelivered(order, email, name);
//     sendAdminOrderDelivered(order, name, email);

//     sendResponse(res, true, order, "Order marked as delivered");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 12. MARK RTO / RETURNED / REFUNDED
// // ═══════════════════════════════════════════════════════════════════════════════
// const markRTO = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     const { type = "rto", reason = "" } = req.body;
//     const validTypes = ["rto", "returned", "refunded"];
//     if (!validTypes.includes(type))
//       return sendResponse(res, false, null, "Invalid type");

//     order.status = type;
//     if (reason) order.cancel_reason = reason;
//     pushHistory(order, type, req.user?.name || "admin", reason);
//     await order.save();

//     const { email, name } = getCustomerInfo(order);
//     sendOrderRTO(order, email, name);
//     sendAdminOrderRTO(order, name, email);

//     sendResponse(res, true, order, `Order marked as ${type}`);
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 13. GENERATE INVOICE
// // ═══════════════════════════════════════════════════════════════════════════════

// const generateInvoice = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "user_id",
//       "name email",
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     const items = await OrderItem.find({ order_id: order._id })
//       .populate("product_id", "name")
//       .populate("variant_id", "sku");

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=invoice-${order.order_number}.pdf`,
//     );

//     const doc = new PDFDocument({ margin: 40, size: "A4" });
//     doc.pipe(res);

//     doc
//       .fontSize(22)
//       .font("Helvetica-Bold")
//       .text("TAX INVOICE", { align: "center" });
//     doc.moveDown(0.3);
//     doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
//     doc.moveDown(1.5);

//     doc.fontSize(10).font("Helvetica");

//     doc.font("Helvetica-Bold").text("Invoice No: ", { continued: true });
//     doc.font("Helvetica").text(`INV-${order.order_number}`);

//     doc.font("Helvetica-Bold").text("Date: ", { continued: true });
//     doc
//       .font("Helvetica")
//       .text(`${new Date(order.createdAt).toLocaleDateString("en-IN")}`);

//     doc.font("Helvetica-Bold").text("Order No: ", { continued: true });
//     doc.font("Helvetica").text(`${order.order_number}`);

//     doc.moveDown(2);

//     doc.font("Helvetica-Bold").text("Bill To:");
//     doc.font("Helvetica");
//     const addr = order.shippingAddress;
//     doc.text(
//       `${order.user_id?.name || `${addr.firstName} ${addr.lastName}`.trim()}`,
//     );
//     doc.text(`${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`);
//     doc.font("Helvetica-Bold").text("Mobile: ", { continued: true });
//     doc.font("Helvetica").text(addr.phone);
//     doc.moveDown(1.5);

//     const colX = [40, 220, 310, 380, 465];
//     const headerY = doc.y;

//     doc.font("Helvetica-Bold").fontSize(10);
//     doc.text("Item", colX[0], headerY);
//     doc.text("SKU", colX[1], headerY);
//     doc.text("Qty", colX[2], headerY);
//     doc.text("Rate", colX[3], headerY);
//     doc.text("Amount", colX[4], headerY);
//     doc
//       .moveTo(40, headerY + 15)
//       .lineTo(555, headerY + 15)
//       .stroke();
//     doc.y = headerY + 25;

//     doc.font("Helvetica").fontSize(10);
//     items.forEach((item) => {
//       const y = doc.y + 3;
//       doc.text(item.product_id?.name || "Product name", colX[0], y, {
//         width: 175,
//       });
//       doc.text(item.variant_id?.sku || item.product_id?.sku || "-", colX[1], y);
//       doc.text(String(item.quantity), colX[2], y);
//       doc.text(`${item.price_at_order}`, colX[3], y);
//       doc.text(`${item.price_at_order * item.quantity}`, colX[4], y);
//       doc.moveDown(1.2);
//     });

//     doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
//     doc.moveDown(0.5);
//     doc.font("Helvetica-Bold").text("Grand Total:", { align: "right" });
//     doc.font("Helvetica").text(`${order.total_price}`, { align: "right" });

//     doc
//       .font("Helvetica")
//       .fontSize(9)
//       .text(`Payment: ${order.payment_method} (${order.payment_status})`, {
//         align: "right",
//       });

//     doc.end();

//     await Order.findByIdAndUpdate(req.params.id, { invoice_generated: true });
//   } catch (err) {
//     if (!res.headersSent) sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 14. UPDATE ORDER
// // ═══════════════════════════════════════════════════════════════════════════════
// const updateOrder = async (req, res) => {
//   try {
//     const { items, status, coupon_id } = req.body;
//     const order = await Order.findById(req.params.id);
//     if (!order) return sendResponse(res, false, null, "Order not found");

//     const oldItems = await OrderItem.find({ order_id: order._id });
//     for (const oldItem of oldItems) {
//       const variant = await ProductVariant.findById(oldItem.variant_id);
//       if (variant) {
//         variant.stock_quantity += oldItem.quantity;
//         await variant.save();
//       }
//     }

//     await OrderItem.deleteMany({ order_id: order._id });

//     let total_price = 0;
//     const newOrderItems = [];

//     for (const item of items) {
//       const variant = await ProductVariant.findById(item.variant_id).populate(
//         "product_id",
//       );
//       if (!variant) return sendResponse(res, false, null, "Variant not found");
//       if (variant.stock_quantity < item.quantity)
//         return sendResponse(
//           res,
//           false,
//           null,
//           `Not enough stock for ${variant.sku}`,
//         );

//       let price = variant.price;
//       const discount_id = variant.product_id.discount_id;
//       if (discount_id) {
//         const discount = await Discount.findById(discount_id);
//         if (isDiscountValid(discount)) {
//           if (discount.type === "percentage")
//             price = price - (price * discount.value) / 100;
//           else if (discount.type === "fixed") price = price - discount.value;
//           if (price < 0) price = 0;
//         }
//       }

//       total_price += price * item.quantity;
//       variant.stock_quantity -= item.quantity;
//       await variant.save();

//       newOrderItems.push({
//         order_id: order._id,
//         product_id: variant.product_id._id,
//         variant_id: variant._id,
//         quantity: item.quantity,
//         price_at_order: price,
//       });
//     }

//     await OrderItem.insertMany(newOrderItems);
//     order.total_price = total_price;
//     if (status) order.status = status;
//     if (coupon_id) order.coupon_id = coupon_id;
//     await order.save();

//     sendResponse(res, true, order, "Order updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 15. UPDATE STATUS
// // ═══════════════════════════════════════════════════════════════════════════════
// const updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const validStatuses = [
//       "pending",
//       "processing",
//       "packed",
//       "ready_to_ship",
//       "shipped",
//       "in_transit",
//       "completed",
//       "cancelled",
//       "rto",
//       "returned",
//       "refunded",
//     ];
//     if (!validStatuses.includes(status))
//       return sendResponse(res, false, null, "Invalid status value");

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true },
//     );
//     if (!order) return sendResponse(res, false, null, "Order not found");
//     sendResponse(res, true, order, "Order status updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 16. DELETE ORDER
// // ═══════════════════════════════════════════════════════════════════════════════
// const deleteOrder = async (req, res) => {
//   try {
//     const deletedOrder = await Order.findByIdAndDelete(req.params.id);
//     if (!deletedOrder) return sendResponse(res, false, null, "Order not found");
//     await OrderItem.deleteMany({ order_id: deletedOrder._id });
//     sendResponse(res, true, null, "Order deleted successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // 17. BULK DELETE
// // ═══════════════════════════════════════════════════════════════════════════════
// const bulkDeleteOrders = async (req, res) => {
//   try {
//     const { ids } = req.body;
//     if (!ids || !ids.length)
//       return sendResponse(res, false, null, "No IDs provided");
//     const result = await Order.deleteMany({ _id: { $in: ids } });
//     await OrderItem.deleteMany({ order_id: { $in: ids } });
//     sendResponse(
//       res,
//       true,
//       { deletedCount: result.deletedCount },
//       "Orders deleted successfully",
//     );
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// module.exports = {
//   getOrders,
//   getPublicUserOrders,
//   getOrderById,
//   createOrder,
//   updateOrder,
//   deleteOrder,
//   bulkDeleteOrders,
//   updateOrderStatus,
//   confirmOrder,
//   cancelOrder,
//   packOrder,
//   generatePackingSlip,
//   assignCourier,
//   shipOrder,
//   updateTracking,
//   markDelivered,
//   markRTO,
//   generateInvoice,
// };

const mongoose = require("mongoose");
const Discount = require("../models/Discount");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Packing = require("../models/paking");
const ProductVariant = require("../models/ProductVariant");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");
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
  sendAdminNewOrder,
  sendAdminOrderConfirmed,
  sendAdminOrderPacked,
  sendAdminCourierAssigned,
  sendAdminOrderShipped,
  sendAdminTrackingUpdated,
  sendAdminOrderDelivered,
  sendAdminOrderCancelled,
  sendAdminOrderRTO,
} = require("../utils/orderEmailService");

// ─── Type-safe helpers ────────────────────────────────────────────────────────

/**
 * Safely convert a query/body param to a trimmed string.
 * Returns "" if the value is not a primitive string or number.
 */
const safeString = (val) => {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  return "";
};

/**
 * Safely split a comma-separated query param into an array of trimmed strings.
 * Validates each entry as a valid MongoDB ObjectId before mapping.
 * Returns [] if input is not a non-empty string.
 */
const safeObjectIdArray = (val) => {
  const str = safeString(val);
  if (!str) return [];
  return str
    .split(",")
    .map((id) => id.trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};

/**
 * Safely ensure a value is an array with a .length check.
 * Fixes CWE-1287 on req.body array fields like `items` and `ids`.
 */
const safeArray = (val) => (Array.isArray(val) ? val : []);

// ─── Existing helpers ─────────────────────────────────────────────────────────

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

    // Guard against NaN from bad query params
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // FIX CWE-1287: safeString before .toLowerCase()
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

    const orderMatch = {};

    // FIX CWE-1287: safeString before using search in regex
    const safeSearch = safeString(search);
    if (safeSearch) {
      orderMatch.$or = [
        { status: { $regex: safeSearch, $options: "i" } },
        { order_number: { $regex: safeSearch, $options: "i" } },
      ];
    }

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
      // FIX CWE-1287 Ln 153: safeObjectIdArray handles type check + split safely
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
      // FIX CWE-1287 Ln 153: safeObjectIdArray replaces manual .split(",")
      const productArray = safeObjectIdArray(product);
      if (productArray.length > 0) {
        itemMatch.product_id = { $in: productArray };
      }
    }

    if (color) {
      // FIX CWE-1287 Ln 159: safeObjectIdArray replaces manual .split(",")
      const colorArray = safeObjectIdArray(color);
      if (colorArray.length > 0) {
        itemMatch["variant_id.color_id"] = { $in: colorArray };
      }
    }

    if (size) {
      // FIX CWE-1287 Ln 165: safeObjectIdArray replaces manual .split(",")
      const sizeArray = safeObjectIdArray(size);
      if (sizeArray.length > 0) {
        itemMatch["variant_id.size_id"] = { $in: sizeArray };
      }
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
            { $match: Object.keys(itemMatch).length ? itemMatch : {} },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ];

    if (!download) {
      pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
    }

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
// 1B. GET PUBLIC USER ORDERS — store_user only sees their OWN orders
// ═══════════════════════════════════════════════════════════════════════════════
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
        populate: [
          { path: "color_id", select: "name" },
          { path: "size_id", select: "name" },
        ],
      });

    sendResponse(res, true, { order, items }, "Order retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CREATE ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      coupon_id,
      shippingAddress,
      payment_method = "COD",
      transaction_id,
    } = req.body;

    // FIX CWE-1287 Ln 460: safeArray ensures items is always an array before .length check
    const items = safeArray(req.body.items);
    if (!items.length) {
      return sendResponse(res, false, null, "No items provided");
    }

    let total_price = 0;
    const orderItems = [];
    let store_owner_id = null;

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

      if (!store_owner_id && variant.product_id?.createdBy) {
        store_owner_id =
          variant.product_id.createdBy._id || variant.product_id.createdBy;
      }

      let price = variant.price;
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

      total_price += price * item.quantity;
      variant.stock_quantity -= item.quantity;
      await variant.save();

      orderItems.push({
        order_id: null,
        product_id: variant.product_id._id,
        variant_id: variant._id,
        quantity: item.quantity,
        price_at_order: price,
      });
    }

    const order = new Order({
      user_id,
      total_price,
      coupon_id: coupon_id || null,
      shippingAddress,
      payment_method,
      payment_status:
        payment_method === "Online" && transaction_id ? "paid" : "pending",
      transaction_id: transaction_id || "",
      status: "pending",
      store_owner_id: store_owner_id || null,
    });

    pushHistory(order, "pending", "customer", "Order placed");
    const savedOrder = await order.save();

    orderItems.forEach((oi) => (oi.order_id = savedOrder._id));
    await OrderItem.insertMany(orderItems);

    const populatedForEmail = await Order.findById(savedOrder._id).populate(
      "user_id",
      "name email",
    );
    const { email: placedEmail, name: placedName } = getCustomerInfo(
      populatedForEmail || savedOrder,
    );
    sendOrderPlaced(populatedForEmail || savedOrder, placedEmail, placedName);
    sendAdminNewOrder(populatedForEmail || savedOrder, placedName, placedEmail);
    sendResponse(res, true, savedOrder, "Order created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CONFIRM ORDER → creates Packing record automatically
// ═══════════════════════════════════════════════════════════════════════════════
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
      req.body.admin_note || "",
    );
    await order.save();

    const { email, name } = getCustomerInfo(order);
    sendOrderConfirmed(order, email, name);
    sendAdminOrderConfirmed(order, name, email);

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

    if (
      req.user?.role === "store_user" &&
      order.user_id?._id?.toString() !== req.user._id.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your order");
    }

    if (["cancelled", "completed", "refunded"].includes(order.status)) {
      return sendResponse(
        res,
        false,
        null,
        `Cannot cancel order with status '${order.status}'`,
      );
    }

    const { reason = "Cancelled by customer" } = req.body;
    order.status = "cancelled";
    order.cancel_reason = safeString(reason);
    pushHistory(
      order,
      "cancelled",
      req.user?.name || "customer",
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

    const { email, name } = getCustomerInfo(order);
    sendOrderCancelled(order, email, name);
    sendAdminOrderCancelled(order, name, email);

    sendResponse(res, true, order, "Order cancelled");
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
    sendOrderPacked(order, email, name);
    sendAdminOrderPacked(order, name, email);

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
      ["Warehouse", packing.warehouse_name || "\u2014"],
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
      addr.pincode ? `\u2014 ${addr.pincode}` : "",
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

    const phone = addr.phone || packing.customer?.mobile || "\u2014";
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
      doc.text(item.name || "\u2014", cols[0].x + 3, y + 4, {
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
    y += 8;

    const QR_SIZE = 72;
    const qrX = R - QR_SIZE;
    const sumX = L;
    const sumW = W - QR_SIZE - 10;
    const summaryStartY = y;

    const summaryRows = [
      ["Total Items", String(totalQty)],
      ["Total Weight", `${packing.total_weight || 0}g`],
    ];

    summaryRows.forEach(([label, val]) => {
      doc
        .font("Helvetica")
        .fontSize(8)
        .text(label, sumX, y, {
          width: sumW * 0.55,
          align: "left",
          lineBreak: false,
        });
      doc.text(val, sumX + sumW * 0.55, y, {
        width: sumW * 0.45,
        align: "right",
        lineBreak: false,
      });
      y += 12;
    });

    y += 4;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#1e3a5f")
      .text("Grand Total", sumX, y, {
        width: sumW * 0.55,
        align: "left",
        lineBreak: false,
      });
    doc.text(
      `${Number(packing.total_amount).toLocaleString("en-IN")}`,
      sumX + sumW * 0.55,
      y,
      { width: sumW * 0.45, align: "right", lineBreak: false },
    );
    doc.fillColor("black");
    y += 14;

    doc.image(qrBuffer, qrX, summaryStartY, {
      width: QR_SIZE,
      height: QR_SIZE,
    });
    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#888888")
      .text("Scan to verify order", qrX, summaryStartY + QR_SIZE + 2, {
        width: QR_SIZE,
        align: "center",
      });
    doc.fillColor("black");

    y = Math.max(y, summaryStartY + QR_SIZE + 14);

    if (order.payment_method === "COD") {
      y += 4;
      doc.rect(L, y, W, 22).fill("#fff3cd").stroke("#ffc107");
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#7d4e00")
        .text(
          `COD COLLECTION: ${Number(packing.cod_amount).toLocaleString("en-IN")}`,
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
    const courier_name = safeString(req.body.courier_name);
    const awb_number = safeString(req.body.awb_number);
    const pickup_date = safeString(req.body.pickup_date);

    order.courier = {
      partner,
      name: courier_name,
      awb_number,
      tracking_url: getTrackingUrl(partner, awb_number),
      pickup_date: pickup_date ? new Date(pickup_date) : undefined,
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
    sendCourierAssigned(order, email, name);
    sendAdminCourierAssigned(order, name, email);

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
    sendOrderShipped(order, email, name);
    sendAdminOrderShipped(order, name, email);

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

    // Validate tracking_url is http/https only
    if (tracking_url) {
      try {
        const parsed = new URL(tracking_url);
        if (
          order.courier &&
          (parsed.protocol === "http:" || parsed.protocol === "https:")
        ) {
          order.courier.tracking_url = tracking_url;
        }
      } catch (_) {
        // invalid URL — skip silently
      }
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
    sendTrackingUpdated(order, email, name);
    sendAdminTrackingUpdated(order, name, email);

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

    const { email, name } = getCustomerInfo(order);
    sendOrderDelivered(order, email, name);
    sendAdminOrderDelivered(order, name, email);

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
    sendOrderRTO(order, email, name);
    sendAdminOrderRTO(order, name, email);

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

    // FIX CWE-1287 Ln 1500: safeArray ensures items is always an array before .length check
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
      { new: true },
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
    // FIX CWE-1287: safeArray ensures ids is always a real array before .length check
    const ids = safeArray(req.body.ids);
    if (!ids.length) return sendResponse(res, false, null, "No IDs provided");

    // Validate each ID is a valid ObjectId before passing to DB
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

module.exports = {
  getOrders,
  getPublicUserOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
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
};

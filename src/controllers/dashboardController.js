
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Store = require("../models/Store");
const Coupon = require("../models/Coupon");
const { sendResponse } = require("../utils/response");

const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const isAdmin = req.user.role === "admin";
    const ownerId = req.user._id;

    const productFilter = isAdmin ? {} : { createdBy: ownerId };
    const orderFilter = isAdmin ? {} : { store_owner_id: ownerId };
    const paymentFilter = isAdmin
      ? { status: "completed" }
      : { status: "completed", store_owner_id: ownerId };

    let storeDomain = null;
    if (!isAdmin) {
      const store = await Store.findById(req.user.storeId);
      storeDomain = store?.domain || null;
    }

    const userFilter = isAdmin
      ? { role: "store_user" }
      : { role: "store_user", domain: storeDomain };

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23, 59, 59, 999
    );

    const totalProducts = await Product.countDocuments(productFilter);
    const prevMonthProducts = await Product.countDocuments({
      ...productFilter,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });
    const currMonthProducts = await Product.countDocuments({
      ...productFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const totalOrders = await Order.countDocuments(orderFilter);
    const prevMonthOrders = await Order.countDocuments({
      ...orderFilter,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });
    const currMonthOrders = await Order.countDocuments({
      ...orderFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const totalUsers = await User.countDocuments(userFilter);
    const prevMonthUsers = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });
    const currMonthUsers = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const revenueAgg = await Payment.aggregate([
      { $match: paymentFilter },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const prevRevenueAgg = await Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          payment_date: { $gte: prevMonthStart, $lte: prevMonthEnd },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);
    const prevMonthRevenue = prevRevenueAgg[0]?.totalRevenue || 0;

    const currRevenueAgg = await Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          payment_date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$amount_paid" } } },
    ]);
    const currMonthRevenue = currRevenueAgg[0]?.totalRevenue || 0;

    const couponFilter = {
      status: "active",
      ...(isAdmin ? {} : { createdBy: ownerId }),
      $and: [
        { $or: [{ start_date: { $lte: now } }, { start_date: null }] },
        { $or: [{ end_date: { $gte: now } }, { end_date: null }] },
      ],
    };
    const activeCoupons = await Coupon.countDocuments(couponFilter);

    const prevCouponFilter = {
      status: "active",
      ...(isAdmin ? {} : { createdBy: ownerId }),
      createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
    };
    const prevMonthCoupons = await Coupon.countDocuments(prevCouponFilter);

    const currCouponFilter = {
      status: "active",
      ...(isAdmin ? {} : { createdBy: ownerId }),
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    };
    const currMonthCoupons = await Coupon.countDocuments(currCouponFilter);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesOverview = await Payment.aggregate([
      {
        $match: {
          ...paymentFilter,
          payment_date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$payment_date" },
          },
          revenue: { $sum: "$amount_paid" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $match: orderFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    let topSellingProducts;
    if (isAdmin) {
      topSellingProducts = await OrderItem.aggregate([
        { $group: { _id: "$product_id", quantity: { $sum: "$quantity" } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $project: { _id: 0, name: "$product.name", quantity: 1 } },
      ]);
    } else {
      const ownerOrderIds = await Order.distinct("_id", {
        store_owner_id: ownerId,
      });
      topSellingProducts = await OrderItem.aggregate([
        { $match: { order_id: { $in: ownerOrderIds } } },
        { $group: { _id: "$product_id", quantity: { $sum: "$quantity" } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $project: { _id: 0, name: "$product.name", quantity: 1 } },
      ]);
    }

    const recentOrdersRaw = await Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user_id", "name email");

    const recentOrders = await Promise.all(
      recentOrdersRaw.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id })
          .populate("product_id", "name")
          .populate("variant_id", "sku price");
        return { ...order.toObject(), items };
      })
    );

    return sendResponse(res, true, {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      activeCoupons,
      salesOverview,
      ordersByStatus,
      topSellingProducts,
      recentOrders,
      monthlyStats: {
        products: { current: currMonthProducts, previous: prevMonthProducts },
        orders: { current: currMonthOrders, previous: prevMonthOrders },
        users: { current: currMonthUsers, previous: prevMonthUsers },
        revenue: { current: currMonthRevenue, previous: prevMonthRevenue },
        coupons: { current: currMonthCoupons, previous: prevMonthCoupons },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return sendResponse(res, false, null, error.message);
  }
};

module.exports = { getDashboard };
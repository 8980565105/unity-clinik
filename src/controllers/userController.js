const User = require("../models/User");
const Store = require("../models/Store");
const { sendResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Coupon = require("../models/Coupon");
const Wallet = require("../models/Wallet");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const PageVisit = require("../models/PageVisit");

const deleteOldProfilePicture = (filename) => {
  if (!filename || filename.startsWith("http")) return;
  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, "../uploads", safeFilename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) ("[Upload] Error:", err.message);
    });
  }
};

const getUsers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      is_active,
      role: roleFilter,
      authProvider,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";
    const loggedInUser = req.user;

    if (!loggedInUser)
      return sendResponse(res, false, null, "User not authenticated");

    const baseQuery = {};

    if (loggedInUser.role === "admin") {
      if (roleFilter) baseQuery.role = roleFilter;
    } else if (loggedInUser.role === "user") {
      baseQuery.role = "user";
    } else {
      return sendResponse(res, false, null, "Access denied: Unauthorized role");
    }

    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (is_active === "true") baseQuery.is_active = true;
    else if (is_active === "false") baseQuery.is_active = false;

    const validProviders = ["email", "phone", "google"];
    if (authProvider && validProviders.includes(authProvider)) {
      baseQuery.authProvider = authProvider;
    }

    if (download) {
      const users = await User.find(baseQuery)
        .sort({ createdAt: -1 })
        .select("-password")
        .populate("storeId");
      return sendResponse(
        res,
        true,
        { users },
        "All users downloaded successfully",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const total = await User.countDocuments(baseQuery);
    const users = await User.find(baseQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-password")
      .populate("storeId");

    return sendResponse(
      res,
      true,
      { users, total, page, pages: Math.ceil(total / limit) },
      "Users retrieved successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve users: " + err.message,
    );
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, user, "User details retrieved successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve user: " + err.message,
    );
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "user",
      mobile_number,
      addresses,
      gender,
      date_of_birth,
      domain,
      storeId: bodyStoreId,
    } = req.body;
    const profile_picture = req.files?.profile_picture?.[0]?.filename || null;

    let resolvedStoreId = bodyStoreId || null;
    let storeDomain = domain || "";

    if (!resolvedStoreId && domain) {
      const safeDomain =
        typeof domain === "string"
          ? domain.toLowerCase().trim()
          : String(domain).toLowerCase().trim();

      const store = await Store.findOne({
        domain: safeDomain,
      });

      if (store) {
        resolvedStoreId = store._id;
        storeDomain = store.domain;
      }
    }

    if (!resolvedStoreId && req.user?.role === "user") {
      resolvedStoreId = req.user.storeId;
      if (!storeDomain) {
        const store = await Store.findById(resolvedStoreId).select("domain");
        if (store) storeDomain = store.domain;
      }
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return sendResponse(res, false, null, "Email already exists");
    }

    const newUser = await User.create({
      name,
      email,
      password: password,
      role: role,
      mobile_number,
      addresses,
      gender,
      date_of_birth,
      profile_picture,
    });

    return sendResponse(
      res,
      true,
      { user: { ...newUser.toObject(), password: undefined } },
      "User created successfully",
    );
  } catch (err) {
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "A user with this email is already registered in this store",
      );
    return sendResponse(
      res,
      false,
      null,
      "Failed to create user: " + err.message,
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await User.findById(userId);
    if (!existingUser) return sendResponse(res, false, null, "User not found");

    const {
      name,
      email,
      password,
      role,
      mobile_number,
      addresses,
      gender,
      date_of_birth,
    } = req.body;
    const newProfilePicture = req.files?.profile_picture?.[0]?.filename;

    if (email && email !== existingUser.email) {
      const dup = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (dup)
        return sendResponse(
          res,
          false,
          null,
          "This email is already in use in this store",
        );
    }

    const updateData = {
      name,
      email,
      mobile_number,
      addresses,
      gender,
      date_of_birth,
    };

    if (newProfilePicture) {
      deleteOldProfilePicture(existingUser.profile_picture);
      updateData.profile_picture = newProfilePicture;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    if (role && req.user.role === "admin") updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
    }).select("-password");

    return sendResponse(
      res,
      true,
      { user: updatedUser },
      "User updated successfully",
    );
  } catch (err) {
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "This email is already in use in this store",
      );
    return sendResponse(
      res,
      false,
      null,
      "Failed to update user: " + err.message,
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, false, null, "User not found");
    if (req.user._id.toString() === user._id.toString())
      return sendResponse(
        res,
        false,
        null,
        "You cannot delete your own account",
      );
    deleteOldProfilePicture(user.profile_picture);
    await User.findByIdAndDelete(user._id);
    return sendResponse(res, true, null, "User deleted successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete user: " + err.message,
    );
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, false, null, "User not found");
    if (req.user._id.toString() === req.params.id)
      return sendResponse(
        res,
        false,
        null,
        "You cannot change your own status",
      );
    user.is_active = Boolean(is_active);
    await user.save();
    return sendResponse(
      res,
      true,
      { user },
      "User status updated successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to update user status: " + err.message,
    );
  }
};

const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return sendResponse(
        res,
        false,
        null,
        "No user IDs provided for deletion",
      );
    const users = await User.find({ _id: { $in: ids } });
    users.forEach((u) => deleteOldProfilePicture(u.profile_picture));
    await User.deleteMany({ _id: { $in: ids } });
    return sendResponse(
      res,
      true,
      { deletedCount: ids.length },
      "Selected users deleted successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete users: " + err.message,
    );
  }
};

const getOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, { user }, "Profile fetched successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to fetch profile: " + err.message,
    );
  }
};

const updateOwnProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile_number,
      addresses,
      gender,
      date_of_birth,
      password,
    } = req.body;
    const newProfilePicture = req.files?.profile_picture?.[0]?.filename;
    const updateData = {
      name,
      email,
      mobile_number,
      addresses,
      gender,
      date_of_birth,
    };

    if (email && email !== req.user.email) {
      const dup = await User.findOne({
        email,
        storeId: req.user.storeId,
        _id: { $ne: req.user._id },
      });
      if (dup)
        return sendResponse(
          res,
          false,
          null,
          "This email is already in use in this store",
        );
    }
    if (newProfilePicture) {
      const cur = await User.findById(req.user._id);
      if (cur?.profile_picture) deleteOldProfilePicture(cur.profile_picture);
      updateData.profile_picture = newProfilePicture;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      returnDocument: "after",
    }).select("-password");
    return sendResponse(
      res,
      true,
      { user: updatedUser },
      "Profile updated successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to update profile: " + err.message,
    );
  }
};

const deleteOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user?.profile_picture) deleteOldProfilePicture(user.profile_picture);
    await User.findByIdAndDelete(req.user._id);
    return sendResponse(res, true, null, "Account deleted successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete account: " + err.message,
    );
  }
};

const getUserTracking = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return sendResponse(res, false, null, "User not found");

    const orders = await Order.find({ user_id: userId }).sort({
      createdAt: -1,
    });

    const totalOrders = orders.length;
    const validOrders = orders.filter(
      (o) => !["cancelled", "returned"].includes(o.status),
    );
    const totalSpending = validOrders.reduce(
      (sum, o) => sum + (o.total_price || 0),
      0,
    );
    const avgOrderValue =
      validOrders.length > 0 ? totalSpending / validOrders.length : 0;
    const lastOrderDate = orders[0]?.createdAt || null;
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled",
    ).length;
    const returnedOrders = orders.filter((o) => o.status === "returned").length;
    const refundedOrders = orders.filter(
      (o) => o.payment_status === "refunded",
    ).length;

    const paymentCounts = {};
    orders.forEach((o) => {
      const m = o.payment_method || "Unknown";
      paymentCounts[m] = (paymentCounts[m] || 0) + 1;
    });
    const preferredPaymentMethod =
      Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const couponsUsed = orders.filter((o) => o.coupon_id).length;
    let couponCodesUsed = [];
    try {
      couponCodesUsed = await Coupon.find({
        "user_usage.user_id": userId,
      }).select("code discount_type discount_value");
    } catch (e) {
      couponCodesUsed = [];
    }

    let walletBalance = 0;
    let walletTransactions = [];

    try {
      const wallet = await Wallet.findOne({ userId });

      if (wallet) {
        walletBalance = wallet.balance || 0;

        walletTransactions = (wallet.transactions || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 20)
          .map((t) => ({
            type: t.type,
            amount: t.points,
            description: t.reason,
            transaction_id: t.transaction_id,
            orderId: t.orderId,
            date: t.createdAt,
          }));
      }
    } catch (err) {
      walletBalance = 0;
      walletTransactions = [];
    }
    let wishlist = [];
    try {
      const wl = await Wishlist.findOne({ user_id: userId }).populate(
        "items.product_id",
        "name",
      );
      wishlist = wl?.items || [];
    } catch (e) {
      wishlist = [];
    }

    let cartItems = [];
    try {
      const cart = await Cart.findOne({ user_id: userId }).populate(
        "items.product_id",
        "name",
      );
      cartItems = cart?.items || [];
    } catch (e) {
      cartItems = [];
    }

    const orderTimeline = orders.slice(0, 10).map((o) => ({
      order_number: o.order_number,
      status: o.status,
      amount: o.total_price,
      date: o.createdAt,
    }));

    const daysSinceJoin =
      (Date.now() - new Date(user.createdAt).getTime()) / 86400000;
    const daysSinceLastOrder = lastOrderDate
      ? (Date.now() - new Date(lastOrderDate).getTime()) / 86400000
      : null;

    const tags = [];
    if (daysSinceJoin <= 7) tags.push("New User");
    if (totalOrders === 0) tags.push("No Purchase Yet");
    else if (totalOrders === 1) tags.push("First-time Buyer");
    else if (totalOrders >= 5) tags.push("Repeat Customer");
    if (totalSpending >= 10000) tags.push("High Spender");
    if (daysSinceLastOrder !== null && daysSinceLastOrder >= 60)
      tags.push("At Risk");
    if (!user.is_active) tags.push("Inactive");
    if (cartItems.length > 0 && totalOrders === 0) tags.push("Abandoned Cart");
    if (couponsUsed > 0) tags.push("Coupon User");

    const allOrderItems = await OrderItem.find({
      order_id: { $in: orders.map((o) => o._id) },
    }).populate("product_id", "name category_id");

    const totalItemsPurchased = allOrderItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );

    const avgItemsPerOrder =
      totalOrders > 0 ? totalItemsPurchased / totalOrders : 0;

    const productFrequency = {};
    allOrderItems.forEach((item) => {
      const name = item.product_id?.name || "Unknown Product";
      productFrequency[name] =
        (productFrequency[name] || 0) + (item.quantity || 0);
    });
    const mostPurchasedProduct =
      Object.entries(productFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      null;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayFrequency = {};
    orders.forEach((o) => {
      const day = dayNames[new Date(o.createdAt).getDay()];
      dayFrequency[day] = (dayFrequency[day] || 0) + 1;
    });
    const preferredShoppingDay =
      Object.entries(dayFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const getTimeSlot = (hour) => {
      if (hour >= 5 && hour < 12) return "Morning";
      if (hour >= 12 && hour < 17) return "Afternoon";
      if (hour >= 17 && hour < 21) return "Evening";
      return "Night";
    };

    const timeFrequency = {};

    orders.forEach((o) => {
      const hour = Number(
        new Intl.DateTimeFormat("en-IN", {
          hour: "numeric",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date(o.createdAt)),
      );

      const slot = getTimeSlot(hour);

      timeFrequency[slot] = (timeFrequency[slot] || 0) + 1;
    });

    const preferredShoppingTime =
      Object.entries(timeFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const accountAgeMonths = Math.max(daysSinceJoin / 30, 1);
    const purchaseFrequency = (totalOrders / accountAgeMonths).toFixed(1);

    const cartAbandoned = cartItems.length > 0 && totalOrders === 0;

    const shoppingBehavior = {
      totalItemsPurchased,
      avgItemsPerOrder: Number(avgItemsPerOrder.toFixed(1)),
      mostPurchasedProduct,
      preferredShoppingDay,
      preferredShoppingTime,
      purchaseFrequency: Number(purchaseFrequency),
      cartAbandoned,
    };

    const daysSinceLastLogin = user.lastLogin
      ? (Date.now() - new Date(user.lastLogin).getTime()) / 86400000
      : null;

    const accountAgeMonthsForEngagement = Math.max(daysSinceJoin / 30, 1);
    const loginFrequency = Number(
      ((user.loginCount || 0) / accountAgeMonthsForEngagement).toFixed(1),
    );

    const loginHistoryList = user.loginHistory || [];
    const recentLogins30d = loginHistoryList.filter((h) => {
      const days = (Date.now() - new Date(h.loggedInAt).getTime()) / 86400000;
      return days <= 30;
    }).length;

    const wishlistCount = wishlist?.length || 0;
    const cartCount = cartItems?.length || 0;

    let engagementScore = 0;
    const engagementSignals = [];

    if (daysSinceLastLogin !== null && daysSinceLastLogin <= 7) {
      engagementScore += 30;
      engagementSignals.push("Logged in within last 7 days");
    } else if (daysSinceLastLogin !== null && daysSinceLastLogin <= 30) {
      engagementScore += 15;
      engagementSignals.push("Logged in within last 30 days");
    }

    if (loginFrequency >= 4) {
      engagementScore += 25;
      engagementSignals.push("Frequent logins (4+/month)");
    } else if (loginFrequency >= 1) {
      engagementScore += 10;
      engagementSignals.push("Occasional logins");
    }

    if (wishlistCount > 0) {
      engagementScore += 15;
      engagementSignals.push("Active wishlist usage");
    }

    if (cartCount > 0) {
      engagementScore += 15;
      engagementSignals.push("Items currently in cart");
    }

    if (daysSinceLastOrder !== null && daysSinceLastOrder <= 30) {
      engagementScore += 15;
      engagementSignals.push("Ordered within last 30 days");
    }

    let engagementLevel = "Dormant";
    if (engagementScore >= 60) engagementLevel = "Active";
    else if (engagementScore >= 30) engagementLevel = "Moderate";

    const engagement = {
      daysSinceLastLogin:
        daysSinceLastLogin !== null ? Math.floor(daysSinceLastLogin) : null,
      loginFrequency,
      recentLogins30d,
      wishlistCount,
      cartCount,
      daysSinceLastOrder:
        daysSinceLastOrder !== null ? Math.floor(daysSinceLastOrder) : null,
      engagementScore: Math.min(engagementScore, 100),
      engagementLevel,
      signals: engagementSignals,
    };

    const deviceTracking = {
      loginCount: user.loginCount || 0,
      lastLogin: user.lastLogin || null,
      lastDevice: user.lastDevice || null,
      loginHistory: user.loginHistory || [],
    };

    const purchaseAnalyticsData = {
      totalOrders,
      totalSpending,
      avgOrderValue,
      lastOrderDate,
      preferredPaymentMethod,
      cancelledOrders,
      returnedOrders,
      refundedOrders,
    };

    const couponWalletData = {
      couponsUsed,
      couponCodesUsed,
      walletBalance,
      walletTransactions,
    };

    const pageVisits = await PageVisit.find({ user_id: userId })
      .sort({ visited_at: -1 })
      .limit(200);
   
      const totalPageViews = pageVisits.length;

    const pageFrequency = {};
    pageVisits.forEach((v) => {
      const label = v.page_title || v.page_url;
      pageFrequency[label] = (pageFrequency[label] || 0) + 1;
    });
    const mostVisitedPage =
      Object.entries(pageFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const uniquePagesCount = new Set(pageVisits.map((v) => v.page_url)).size;

    const lastVisit = pageVisits[0] || null;

    const recentPageHistory = pageVisits.slice(0, 10).map((v) => ({
      page_title: v.page_title || v.page_url,
      page_url: v.page_url,
      visited_at: v.visited_at,
      device_type: v.device?.type || null,
    }));

    const pageVisitHistory = {
      totalPageViews,
      uniquePagesCount,
      mostVisitedPage,
      lastVisitedPage: lastVisit
        ? {
            page_title: lastVisit.page_title || lastVisit.page_url,
            visited_at: lastVisit.visited_at,
          }
        : null,
      recentPageHistory,
    };

    function calculateRiskScore(
      purchaseAnalytics,
      deviceTracking,
      couponWallet,
    ) {
      let score = 0;
      const flags = [];

      const { totalOrders, cancelledOrders, returnedOrders } =
        purchaseAnalytics;

      if (totalOrders > 0) {
        const cancelRate = cancelledOrders / totalOrders;
        const returnRate = returnedOrders / totalOrders;

        if (cancelRate > 0.3) {
          score += 25;
          flags.push("High cancellation rate");
        }
        if (returnRate > 0.3) {
          score += 20;
          flags.push("High return rate");
        }
      }

      const loginHistory = deviceTracking?.loginHistory || [];
      const uniqueIps = new Set(loginHistory.map((h) => h.ip)).size;
      if (uniqueIps > 3) {
        score += 15;
        flags.push("Multiple IP addresses");
      }

      const uniqueCities = new Set(loginHistory.map((h) => h.city)).size;
      if (uniqueCities > 2) {
        score += 15;
        flags.push("Multiple locations");
      }

      if (couponWallet?.couponsUsed > 5 && totalOrders < 3) {
        score += 20;
        flags.push("Coupon abuse pattern");
      }

      let level = "Low";
      if (score >= 60) level = "High";
      else if (score >= 30) level = "Medium";

      return { score: Math.min(score, 100), level, flags };
    }

    const riskAssessment = calculateRiskScore(
      purchaseAnalyticsData,
      deviceTracking,
      couponWalletData,
    );

    return sendResponse(
      res,
      true,
      {
        user,
        purchaseAnalytics: purchaseAnalyticsData,
        couponWallet: couponWalletData,
        wishlist,
        cart: cartItems,
        orderTimeline,
        tags,
        deviceTracking,
        riskAssessment,
        shoppingBehavior,
        engagement,
        pageVisitHistory,
      },
      "User tracking data retrieved successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve user tracking: " + err.message,
    );
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
  updateUserStatus,
  getUserTracking,
};

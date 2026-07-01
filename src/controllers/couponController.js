const Coupon = require("../models/Coupon");
const { sendResponse } = require("../utils/response");

const getCoupons = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const userRole = req.user?.role;

    if (!req.user || userRole === "user") {
      query.status = "active";
      query.$and = [
        {
          $or: [
            { end_date: { $exists: false } },
            { end_date: null },
            { end_date: { $gt: new Date() } },
          ],
        },
        {
          $or: [
            { start_date: { $exists: false } },
            { start_date: null },
            { start_date: { $lte: new Date() } },
          ],
        },
        {
          $or: [
            { usage_limit: null },
            { $expr: { $lt: ["$used_count", "$usage_limit"] } },
          ],
        },
      ];

      if (req.user?._id) {
        const Order = require("../models/Order");
        const userOrderCount = await Order.countDocuments({
          user_id: req.user._id,
          status: { $nin: ["cancelled"] },
        });

        if (userOrderCount > 0) {
          if (!query.$and) query.$and = [];
          query.$and.push({
            $or: [
              { coupon_type: { $ne: "first_order" } },
              { coupon_type: { $exists: false } },
            ],
          });
        }
      } else {
        if (!query.$and) query.$and = [];
        query.$and.push({
          $or: [
            { coupon_type: { $ne: "first_order" } },
            { coupon_type: { $exists: false } },
          ],
        });
      }
    } else if (userRole === "admin") {
      if (status && ["active", "inactive"].includes(status)) {
        query.status = status;
      }
    }

    if (download) {
      const coupons = await Coupon.find(query).sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { coupons },
        "All coupons retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      coupons,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("products", "name")
      .populate("subcategories", "name")
      .populate("gift_product_ids", "name _id images price")
      .populate("buy_x_get_y.free_products", "name _id images price");

    if (!coupon) return sendResponse(res, false, null, "Coupon not found");
    sendResponse(res, true, coupon, "Coupon retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCoupon = async (req, res) => {
  try {
    let { code, discount_type, coupon_type } = req.body;

    if (discount_type === "freeshiping" || coupon_type === "free_gift") {
      req.body.discount_value = 0;
    }

    if (coupon_type === "buy_x_get_y") {
      req.body.discount_value = 0;
      req.body.buy_x_get_y = {
        buy_quantity: Number(req.body.buy_x_get_y?.buy_quantity || 0),
        get_quantity: Number(req.body.buy_x_get_y?.get_quantity || 0),
        free_products: req.body.buy_x_get_y?.free_products || [],
      };
    }

    if (coupon_type === "free_gift") {
      req.body.discount_type = "fixed";
      req.body.discount_value = 0;

      if (!req.body.gift_product_ids || !req.body.gift_product_ids.length) {
        if (req.body.gift_product_id) {
          req.body.gift_product_ids = [req.body.gift_product_id];
        }
      }
      delete req.body.gift_product_id;
    } else {
      req.body.gift_product_ids = [];
      delete req.body.gift_product_id;
    }

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return sendResponse(res, false, null, "Coupon code already exists");
    }

    req.body.code = code.toUpperCase();

    const coupon = new Coupon({ ...req.body, createdBy: req.user.id });
    const savedCoupon = await coupon.save();
    sendResponse(res, true, savedCoupon, "Coupon created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCoupon = async (req, res) => {
  try {
    if (req.body.code) {
      const existingCoupon = await Coupon.findOne({
        code: req.body.code,
        _id: { $ne: req.params.id },
      });
      if (existingCoupon) {
        return sendResponse(res, false, null, "Coupon code already exists");
      }
    }

    const { coupon_type } = req.body;

    if (coupon_type === "free_gift") {
      req.body.discount_type = "fixed";
      req.body.discount_value = 0;

      if (!req.body.gift_product_ids || !req.body.gift_product_ids.length) {
        if (req.body.gift_product_id) {
          req.body.gift_product_ids = [req.body.gift_product_id];
        }
      }
      delete req.body.gift_product_id;
    } else {
      req.body.gift_product_ids = [];
      delete req.body.gift_product_id;
    }

    if (coupon_type === "buy_x_get_y") {
      req.body.discount_value = 0;
      req.body.buy_x_get_y = {
        buy_quantity: Number(req.body.buy_x_get_y?.buy_quantity || 0),
        get_quantity: Number(req.body.buy_x_get_y?.get_quantity || 0),
        free_products: req.body.buy_x_get_y?.free_products || [],
      };
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" },
    );

    if (!updatedCoupon)
      return sendResponse(res, false, null, "Coupon not found");

    sendResponse(res, true, updatedCoupon, "Coupon updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCouponStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (!coupon) return sendResponse(res, false, null, "Coupon not found");

    sendResponse(res, true, coupon, "Coupon status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon)
      return sendResponse(res, false, null, "Coupon not found");
    sendResponse(res, true, null, "Coupon deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteCoupons = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Coupon.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Coupons deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, false, null, "Please login to apply coupon");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return sendResponse(res, false, null, "Invalid coupon code");
    }

    if (coupon.status !== "active") {
      return sendResponse(res, false, null, "Coupon is not active");
    }

    const now = new Date();
    if (coupon.start_date && now < coupon.start_date) {
      return sendResponse(res, false, null, "Coupon is not started yet");
    }
    if (coupon.end_date && now > coupon.end_date) {
      return sendResponse(res, false, null, "Coupon has expired");
    }

    if (
      coupon.usage_limit !== null &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return sendResponse(res, false, null, "Coupon usage limit reached");
    }

    if (coupon.userusage_limit !== null) {
      const userEntry = coupon.user_usage.find(
        (u) => u.user_id.toString() === userId.toString(),
      );
      const userUsedCount = userEntry ? userEntry.count : 0;

      if (userUsedCount >= coupon.userusage_limit) {
        return sendResponse(
          res,
          false,
          null,
          "You have already used this coupon maximum times",
        );
      }
    }

    sendResponse(res, true, coupon, "Coupon is valid");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const markCouponUsed = async (couponId, userId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;

  coupon.used_count += 1;

  const userEntry = coupon.user_usage.find(
    (u) => u.user_id.toString() === userId.toString(),
  );

  if (userEntry) {
    userEntry.count += 1;
  } else {
    coupon.user_usage.push({ user_id: userId, count: 1 });
  }

  await coupon.save();
};

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
  applyCoupon,
  markCouponUsed,
};

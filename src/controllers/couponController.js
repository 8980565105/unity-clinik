

const Coupon = require("../models/Coupon");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const generateCouponCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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

    if (!req.user || userRole === "store_user") {
      query.status = "active";
    } else if (userRole === "store_owner") {
      query.createdBy = req.user.id;
      if (status && ["active", "inactive"].includes(status)) {
        query.status = status;
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
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return sendResponse(res, false, null, "Coupon not found");
    sendResponse(res, true, coupon, "Coupon retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCoupon = async (req, res) => {
  try {
    let { code } = req.body;

    if (!code) {
      code = generateCouponCode();
      req.body.code = code;
    }

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return sendResponse(res, false, null, "Coupon code already exists");
    }

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

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
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
      { new: true },
    );

    if (!coupon) {
      return sendResponse(res, false, null, "Coupon not found");
    }

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

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
};

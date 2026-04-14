const Discount = require("../models/Discount");
const { sendResponse } = require("../utils/response");
const crypto = require("crypto");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getPublicDiscounts = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const discounts = await Discount.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ name: 1 });

    res.json({ success: true, data: discounts });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getDiscounts = async (req, res) => {
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
    if (search) query.name = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    applyOwnershipFilter(req, query);

    if (download) {
      const discounts = await Discount.find(query).sort({ name: 1 });
      return sendResponse(
        res,
        true,
        { discounts },
        "All discounts retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Discount.countDocuments(query);
    const discounts = await Discount.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      discounts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return sendResponse(res, false, null, "Discount not found");
    sendResponse(res, true, discount, "Discount retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};


const createDiscount = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin"
        ? req.body.storeId || null
        : req.user.storeId;

    const existing = await Discount.findOne({ name, storeId });
    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Discount "${name}" already exists in your account. Please use a different name.`,
      );
    }

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();

    const discount = new Discount({
      ...req.body,
      code,
      createdBy: req.user._id,
      storeId,
    });

    const savedDiscount = await discount.save();
    sendResponse(res, true, savedDiscount, "Discount created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Discount "${err.keyValue?.name}" already exists in your account.`,
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateDiscount = async (req, res) => {
  try {
    const updatedDiscount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedDiscount)
      return sendResponse(res, false, null, "Discount not found");
    sendResponse(res, true, updatedDiscount, "Discount updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateDiscountStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const discount = await Discount.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!discount) return sendResponse(res, false, null, "Discount not found");

    sendResponse(res, true, discount, "Discount status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteDiscount = async (req, res) => {
  try {
    const deletedDiscount = await Discount.findByIdAndDelete(req.params.id);
    if (!deletedDiscount)
      return sendResponse(res, false, null, "Discount not found");
    sendResponse(res, true, null, "Discount deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteDiscounts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Discount.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Discounts deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getDiscounts,
  getPublicDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  bulkDeleteDiscounts,
  updateDiscountStatus,
};
const ProductLabel = require("../models/ProductLabel");
const { default: slugify } = require("slugify");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

// ═══════════════════════════════════════════════════════════════════
// PUBLIC — Frontend mate (domain thhi storeId resolve)
// ═══════════════════════════════════════════════════════════════════
const getPublicProductLabels = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const labels = await ProductLabel.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ name: 1 });

    res.json({ success: true, data: labels });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
const getProductLabels = async (req, res) => {
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
      const labels = await ProductLabel.find(query).sort({ name: 1 });
      return sendResponse(
        res,
        true,
        { labels },
        "All labels retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await ProductLabel.countDocuments(query);
    const labels = await ProductLabel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    sendResponse(res, true, {
      labels,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getProductLabelById = async (req, res) => {
  try {
    const label = await ProductLabel.findById(req.params.id);
    if (!label)
      return sendResponse(res, false, null, "Product label not found");
    sendResponse(res, true, label, "Product label retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
const createProductLabel = async (req, res) => {
  try {
    const { name, slug, color, status } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");
    if (!color) return sendResponse(res, false, null, "Color is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const existing = await ProductLabel.findOne({ name, storeId });
    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Product label "${name}" already exists in your account. Please use a different name.`,
      );
    }

    const label = new ProductLabel({
      name,
      slug: slug || slugify(name, { lower: true, strict: true }),
      color,
      status: status || "active",
      createdBy: req.user._id,
      storeId,
    });

    const savedLabel = await label.save();
    sendResponse(res, true, savedLabel, "Product label created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Product label "${err.keyValue?.name}" already exists in your account.`,
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateProductLabel = async (req, res) => {
  try {
    const updatedLabel = await ProductLabel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedLabel)
      return sendResponse(res, false, null, "Product label not found");
    sendResponse(res, true, updatedLabel, "Product label updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateProductLabelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const label = await ProductLabel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!label)
      return sendResponse(res, false, null, "Product label not found");

    sendResponse(res, true, label, "Product label status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteProductLabel = async (req, res) => {
  try {
    const deletedLabel = await ProductLabel.findByIdAndDelete(req.params.id);
    if (!deletedLabel)
      return sendResponse(res, false, null, "Product label not found");
    sendResponse(res, true, null, "Product label deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteProductLabels = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await ProductLabel.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Product labels deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getProductLabels,
  getPublicProductLabels,
  getProductLabelById,
  createProductLabel,
  updateProductLabel,
  deleteProductLabel,
  bulkDeleteProductLabels,
  updateProductLabelStatus,
};

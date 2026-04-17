const { default: slugify } = require("slugify");
const Type = require("../models/Type");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

// ═══════════════════════════════════════════════════════════════════
// PUBLIC — Frontend mate (domain thhi storeId resolve)
// ═══════════════════════════════════════════════════════════════════
const getPublicTypes = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const types = await Type.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: types });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
const getTypes = async (req, res) => {
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
    if (status && ["active", "inactive"].includes(status))
      query.status = status;

    applyOwnershipFilter(req, query);

    if (download) {
      const types = await Type.find(query).sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { types },
        "All types retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Type.countDocuments(query);
    const types = await Type.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      types,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getTypeById = async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type) return sendResponse(res, false, null, "Type not found");
    sendResponse(res, true, type, "Type retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// CREATE — storeId auto set thay
// ═══════════════════════════════════════════════════════════════════
const createType = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const type = new Type({
      name,
      description: description || "",
      status: status || "active",
      createdBy: req.user._id,
      storeId, 
    });

    const savedType = await type.save();
    sendResponse(res, true, savedType, "Type created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateType = async (req, res) => {
  try {
    const updatedType = await Type.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedType) return sendResponse(res, false, null, "Type not found");
    sendResponse(res, true, updatedType, "Type updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateTypeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const type = await Type.findByIdAndUpdate(id, { status }, { new: true });
    if (!type) return sendResponse(res, false, null, "Type not found");

    sendResponse(res, true, type, "Type status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteType = async (req, res) => {
  try {
    const deletedType = await Type.findByIdAndDelete(req.params.id);
    if (!deletedType) return sendResponse(res, false, null, "Type not found");
    sendResponse(res, true, null, "Type deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteTypes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Type.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Types deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getTypes,
  getPublicTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
  bulkDeleteTypes,
  updateTypeStatus,
};

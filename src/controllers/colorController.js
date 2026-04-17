
const Color = require("../models/Color");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");


const getPublicColors = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const colors = await Color.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ name: 1 });

    res.json({ success: true, data: colors });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};


const getColors = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    applyOwnershipFilter(req, query);

    if (download) {
      const colors = await Color.find(query).sort({ name: 1 });
      return sendResponse(res, true, { colors }, "All colors retrieved for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Color.countDocuments(query);

    const findQuery = Color.find(query).sort({ name: 1 });
    if (limit > 0) {
      findQuery.skip((page - 1) * limit).limit(limit);
    }
    const colors = await findQuery;

    sendResponse(res, true, {
      colors,
      total,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return sendResponse(res, false, null, "Color not found");
    sendResponse(res, true, color, "Color retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createColor = async (req, res) => {
  try {
    const { name, code, status } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const color = new Color({
      name,
      code,
      status: status || "active",
      createdBy: req.user._id,
      storeId, 
    });
    const savedColor = await color.save();
    sendResponse(res, true, savedColor, "Color created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateColor = async (req, res) => {
  try {
    const updatedColor = await Color.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedColor) return sendResponse(res, false, null, "Color not found");
    sendResponse(res, true, updatedColor, "Color updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateColorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const color = await Color.findByIdAndUpdate(id, { status }, { new: true });
    if (!color) return sendResponse(res, false, null, "Color not found");

    sendResponse(res, true, color, "Color status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteColor = async (req, res) => {
  try {
    const deletedColor = await Color.findByIdAndDelete(req.params.id);
    if (!deletedColor) return sendResponse(res, false, null, "Color not found");
    sendResponse(res, true, null, "Color deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteColors = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Color.deleteMany({ _id: { $in: ids } });
    sendResponse(res, true, { deletedCount: result.deletedCount }, "Colors deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getColors,
  getPublicColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
  bulkDeleteColors,
  updateColorStatus,
};
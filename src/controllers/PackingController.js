const Packing = require("../models/paking");
const { sendResponse } = require("../utils/response");

// ─── GET ALL PACKING ──────────────────────────────────────────────────────────
const getPacking = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      isDownload = "false",
    } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const query = {};
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { warehouse_name: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    if (download) {
      const packings = await Packing.find(query)
        .populate("order_id", "order_number status payment_method")
        .sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { packings, total: packings.length },
        "All packings retrieved",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Packing.countDocuments(query);
    const packings = await Packing.find(query)
      .populate("order_id", "order_number status payment_method courier")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      packings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── GET PACKING BY ID ────────────────────────────────────────────────────────
const getPackingById = async (req, res) => {
  try {
    const packing = await Packing.findById(req.params.id).populate("order_id");
    if (!packing) return sendResponse(res, false, null, "Packing not found");
    sendResponse(res, true, packing, "Packing retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createPacking = async (req, res) => {
  try {
    const packing = new Packing(req.body);
    const saved = await packing.save();
    sendResponse(res, true, saved, "Packing created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── UPDATE PACKING ───────────────────────────────────────────────────────────
const updatePacking = async (req, res) => {
  try {
    const updated = await Packing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return sendResponse(res, false, null, "Packing not found");
    sendResponse(res, true, updated, "Packing updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── UPDATE PACKING STATUS ────────────────────────────────────────────────────
const updatePackingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const packing = await Packing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!packing) return sendResponse(res, false, null, "Packing not found");
    sendResponse(res, true, packing, "Packing status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── DELETE PACKING ───────────────────────────────────────────────────────────
const deletePacking = async (req, res) => {
  try {
    const deleted = await Packing.findByIdAndDelete(req.params.id);
    if (!deleted) return sendResponse(res, false, null, "Packing not found");
    sendResponse(res, true, null, "Packing deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── BULK DELETE PACKING ──────────────────────────────────────────────────────
const bulkDeletePacking = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
    const result = await Packing.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Packings deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPacking,
  getPackingById,
  createPacking,
  updatePacking,
  deletePacking,
  bulkDeletePacking,
  updatePackingStatus,
};

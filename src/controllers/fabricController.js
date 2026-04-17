
const { default: slugify } = require("slugify");
const Fabric = require("../models/Fabric");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");


const getPublicFabrics = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const fabrics = await Fabric.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ name: 1 });

    res.json({ success: true, data: fabrics });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};


const getFabrics = async (req, res) => {
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
      const fabrics = await Fabric.find(query).sort({ name: 1 });
      return sendResponse(
        res,
        true,
        { fabrics },
        "All fabrics retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Fabric.countDocuments(query);
    const fabrics = await Fabric.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    sendResponse(res, true, {
      fabrics,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) return sendResponse(res, false, null, "Fabric not found");
    sendResponse(res, true, fabric, "Fabric retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createFabric = async (req, res) => {
  try {
    const { name, slug, image, status, description } = req.body;
    if (!name) return sendResponse(res, false, null, "Name is required");

    const storeId =
      req.user.role === "admin"
        ? req.body.storeId || null
        : req.user.storeId;

    const existing = await Fabric.findOne({ name, storeId });
    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Fabric "${name}" already exists in your account. Please use a different name.`,
      );
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : image || null;

    const fabric = new Fabric({
      name,
      slug: slug || slugify(name, { lower: true, strict: true }),
      image_url,
      description: description || "",
      status: status || "active",
      createdBy: req.user._id,
      storeId,
    });

    const savedFabric = await fabric.save();
    sendResponse(res, true, savedFabric, "Fabric created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Fabric "${err.keyValue?.name}" already exists in your account.`,
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateFabric = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image_url = req.body.image;
    }

    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!updatedFabric) return sendResponse(res, false, null, "Fabric not found");
    sendResponse(res, true, updatedFabric, "Fabric updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateFabricStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const fabric = await Fabric.findByIdAndUpdate(id, { status }, { new: true });
    if (!fabric) return sendResponse(res, false, null, "Fabric not found");

    sendResponse(res, true, fabric, "Fabric status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteFabric = async (req, res) => {
  try {
    const deletedFabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!deletedFabric) return sendResponse(res, false, null, "Fabric not found");
    sendResponse(res, true, null, "Fabric deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteFabrics = async (req, res) => {
  try {
    const { ids } = req.body;
    // if (!ids || !ids.length)
    if(!Array.isArray(ids) || ids.length === 0)
  
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Fabric.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Fabrics deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getFabrics,
  getPublicFabrics,
  getFabricById,
  createFabric,
  updateFabric,
  deleteFabric,
  bulkDeleteFabrics,
  updateFabricStatus,
};
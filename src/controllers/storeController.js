const { default: slugify } = require("slugify");
const Store = require("../models/Store");
const { sendResponse } = require("../utils/response");

const getStores = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";

    page = parseInt(page);
    limit = parseInt(limit);

    const matchQuery = {};
    if (search) matchQuery.name = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status))
      matchQuery.status = status;

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "storeId",
          as: "assignedUsers",
        },
      },
      {
        $addFields: {
          assignedName: {
            $cond: [
              { $gt: [{ $size: "$assignedUsers" }, 0] },
              { $arrayElemAt: ["$assignedUsers.name", 0] },
              null,
            ],
          },
        },
      },
      { $project: { assignedUsers: 0 } },
      { $sort: { createdAt: -1 } },
    ];

    if (download) {
      const stores = await Store.aggregate(pipeline);
      return sendResponse(
        res,
        true,
        { stores },
        "All stores retrieved for download",
      );
    }

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Store.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const paginatedPipeline = [
      ...pipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const stores = await Store.aggregate(paginatedPipeline);

    sendResponse(res, true, {
      stores,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getStores:", err);
    sendResponse(res, false, null, err.message);
  }
};
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().select("_id name");
    res.json({ success: true, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, store, "Store retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createStore = async (req, res) => {
  const {
    name,
    email,
    phone,
    website,
    logo,
    banner,
    description,
    theme,
    address,
    status,
  } = req.body;

  if (!name || !email)
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required" });

  const storeData = {
    name,
    email,
    phone,
    website,
    logo,
    banner,
    description: description || "",
    theme: theme || {
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      fontFamily: "Roboto",
    },
    address: address || {},
    status: status || "active",
  };

  try {
    const store = new Store(storeData);
    const savedStore = await store.save();
    sendResponse(res, true, savedStore, "Store created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateStore = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!updatedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, updatedStore, "Store updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteStore = async (req, res) => {
  try {
    const deletedStore = await Store.findByIdAndDelete(req.params.id);
    if (!deletedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, null, "Store deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteStores = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Store.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Stores deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};


const getStoreByDomain = async (req, res) => {
  try {
    const { resolveStoreByDomain } = require("../config/domainResolver");

    const origin = req.headers.origin || "";
    let domain = "";
    if (origin) {
      const url = new URL(origin);
      domain = url.host.toLowerCase();
    } else {
      domain = (req.headers.host || "").toLowerCase();
    }

    const store = await Store.findOne({ domain, status: "active" });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found for this domain",
      });
    }

    res.json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const getMyStore = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) return sendResponse(res, false, null, "No store assigned");
    
    const store = await Store.findById(storeId);
    if (!store) return sendResponse(res, false, null, "Store not found");
    
    sendResponse(res, true, store, "Store fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateMyStore = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) return sendResponse(res, false, null, "No store assigned");

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedStore) return sendResponse(res, false, null, "Store not found");
    sendResponse(res, true, updatedStore, "Store updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getStores,
  getAllStores,
  getMyStore,
  updateMyStore,
  getStoreByDomain,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  bulkDeleteStores,
};

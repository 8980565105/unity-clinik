// const Footer = require("../models/Footer");
// const { sendResponse } = require("../utils/response");

// const getFooters = async (req, res) => {
//   try {
//     let { page = 1, limit = 10, search = "", isDownload = "false" ,status} = req.query;
//     const download = isDownload.toLowerCase() === "true";

//     const query = search
//       ? { label: { $regex: search, $options: "i" } }
//       : {};

//     if (download) {
//       const footers = await Footer.find(query).sort({ createdAt: -1 });
//       return sendResponse(res, true, { footers }, "All footers retrieved for download");
//     }

//     if (status && ["active", "inactive"].includes(status)) query.status = status;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const total = await Footer.countDocuments(query);
//     const footers = await Footer.find(query)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     sendResponse(res, true, {
//       footers,
//       total,
//       page,
//       pages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const getFooterById = async (req, res) => {
//   try {
//     const footer = await Footer.findById(req.params.id);
//     if (!footer) return sendResponse(res, false, null, "Footer not found");
//     sendResponse(res, true, footer, "Footer retrieved successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const createFooter = async (req, res) => {
//   try {
//     const footer = new Footer(req.body);
//     const savedFooter = await footer.save();
//     sendResponse(res, true, savedFooter, "Footer created successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const updateFooter = async (req, res) => {
//   try {
//     const updatedFooter = await Footer.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedFooter) return sendResponse(res, false, null, "Footer not found");
//     sendResponse(res, true, updatedFooter, "Footer updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const updateFooterStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const { id } = req.params;

//     if (!["active", "inactive"].includes(status)) {
//       return sendResponse(res, false, null, "Invalid status value");
//     }

//     const footer = await Footer.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!footer) {
//       return sendResponse(res, false, null, "Footer not found");
//     }

//     sendResponse(res, true, footer, "Footer status updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const deleteFooter = async (req, res) => {
//   try {
//     const deletedFooter = await Footer.findByIdAndDelete(req.params.id);
//     if (!deletedFooter) return sendResponse(res, false, null, "Footer not found");
//     sendResponse(res, true, null, "Footer deleted successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const bulkDeleteFooters = async (req, res) => {
//   try {
//     const { ids } = req.body;
//     if (!ids || !ids.length) return sendResponse(res, false, null, "No IDs provided");

//     const result = await Footer.deleteMany({ _id: { $in: ids } });
//     sendResponse(res, true, { deletedCount: result.deletedCount }, "Footers deleted successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// module.exports = {
//   getFooters,
//   getFooterById,
//   createFooter,
//   updateFooter,
//   deleteFooter,
//   bulkDeleteFooters,
//   updateFooterStatus
// };


const Footer = require("../models/Footer");
const { sendResponse } = require("../utils/response");

// ─── GET ALL ──────────────────────────────────────────────────────────────────
// admin   → sees ALL footers
// store_owner → sees only their store's footers
// public  → sees footers for the domain-resolved storeId
const getFooters = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false", status } = req.query;
    const download = isDownload.toLowerCase() === "true";

    // Build base query
    const query = {};

    // ownership filter
    if (req.user) {
      if (req.user.role === "admin") {
        // no storeId filter — sees everything
      } else if (req.user.role === "store_owner") {
        query.storeId = req.user.storeId;
      } else {
        // store_user: filter by their store
        if (req.storeFilter?.storeId) {
          query.storeId = req.storeFilter.storeId;
        }
      }
    } else {
      // unauthenticated public request — use domain-resolved storeId
      if (req.storeFilter?.storeId) {
        query.storeId = req.storeFilter.storeId;
      }
    }

    if (search) {
      query.label = { $regex: search, $options: "i" };
    }

    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    if (download) {
      const footers = await Footer.find(query).sort({ createdAt: -1 });
      return sendResponse(res, true, { footers }, "All footers retrieved for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Footer.countDocuments(query);
    const footers = await Footer.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, { footers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
const getFooterById = async (req, res) => {
  try {
    const footer = await Footer.findById(req.params.id);
    if (!footer) return sendResponse(res, false, null, "Footer not found");

    // store_owner can only see their own store's footer
    if (req.user.role === "store_owner") {
      if (footer.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(res, false, null, "Forbidden: Not your store's footer");
      }
    }

    sendResponse(res, true, footer, "Footer retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createFooter = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.user.role === "store_owner") {
      // Force storeId to their own store
      data.storeId = req.user.storeId;
    } else if (req.user.role === "admin") {
      // Admin can optionally set storeId or leave null (global)
      data.storeId = data.storeId || null;
    }

    const footer = new Footer(data);
    const savedFooter = await footer.save();
    sendResponse(res, true, savedFooter, "Footer created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
const updateFooter = async (req, res) => {
  try {
    const existing = await Footer.findById(req.params.id);
    if (!existing) return sendResponse(res, false, null, "Footer not found");

    // store_owner can only update their own store's footer
    if (req.user.role === "store_owner") {
      if (existing.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(res, false, null, "Forbidden: Not your store's footer");
      }
    }

    const data = { ...req.body };
    // Prevent store_owner from changing storeId
    if (req.user.role === "store_owner") {
      data.storeId = req.user.storeId;
    }

    const updatedFooter = await Footer.findByIdAndUpdate(req.params.id, data, { new: true });
    sendResponse(res, true, updatedFooter, "Footer updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
const updateFooterStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const existing = await Footer.findById(id);
    if (!existing) return sendResponse(res, false, null, "Footer not found");

    if (req.user.role === "store_owner") {
      if (existing.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(res, false, null, "Forbidden: Not your store's footer");
      }
    }

    const footer = await Footer.findByIdAndUpdate(id, { status }, { new: true });
    sendResponse(res, true, footer, "Footer status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
const deleteFooter = async (req, res) => {
  try {
    const existing = await Footer.findById(req.params.id);
    if (!existing) return sendResponse(res, false, null, "Footer not found");

    if (req.user.role === "store_owner") {
      if (existing.storeId?.toString() !== req.user.storeId?.toString()) {
        return sendResponse(res, false, null, "Forbidden: Not your store's footer");
      }
    }

    await Footer.findByIdAndDelete(req.params.id);
    sendResponse(res, true, null, "Footer deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── BULK DELETE ──────────────────────────────────────────────────────────────
const bulkDeleteFooters = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const deleteQuery = { _id: { $in: ids } };

    // store_owner can only bulk-delete their own store's footers
    if (req.user.role === "store_owner") {
      deleteQuery.storeId = req.user.storeId;
    }

    const result = await Footer.deleteMany(deleteQuery);
    sendResponse(res, true, { deletedCount: result.deletedCount }, "Footers deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getFooters,
  getFooterById,
  createFooter,
  updateFooter,
  deleteFooter,
  bulkDeleteFooters,
  updateFooterStatus,
};
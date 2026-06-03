// const Footer = require("../models/Footer");
// const { sendResponse } = require("../utils/response");

// // ─── GET ALL ──────────────────────────────────────────────────────────────────

// const getFooters = async (req, res) => {
//   try {
//     let { page = 1, limit = 10, search = "", isDownload = "false", status } = req.query;
//     const download = isDownload.toLowerCase() === "true";

//     const query = {};

//     if (req.user) {
//       if (req.user.role === "admin") {
//       } else if (req.user.role === "store_owner") {
//       } else {
//       }
//     } else {
//     }

//     if (search) {
//       query.label = { $regex: search, $options: "i" };
//     }

//     if (status && ["active", "inactive"].includes(status)) {
//       query.status = status;
//     }

//     if (download) {
//       const footers = await Footer.find(query).sort({ createdAt: -1 });
//       return sendResponse(res, true, { footers }, "All footers retrieved for download");
//     }

//     page = parseInt(page);
//     limit = parseInt(limit);

//     const total = await Footer.countDocuments(query);
//     const footers = await Footer.find(query)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     sendResponse(res, true, { footers, total, page, pages: Math.ceil(total / limit) });
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const getFooterById = async (req, res) => {
//   try {
//     const footer = await Footer.findById(req.params.id);
//     if (!footer) return sendResponse(res, false, null, "Footer not found");

//     if (req.user.role === "store_owner") {
//     }

//     sendResponse(res, true, footer, "Footer retrieved successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const createFooter = async (req, res) => {
//   try {
//     const data = { ...req.body };

//     if (req.user.role === "store_owner") {
//     } else if (req.user.role === "admin") {
//     }

//     const footer = new Footer(data);
//     const savedFooter = await footer.save();
//     sendResponse(res, true, savedFooter, "Footer created successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// const updateFooter = async (req, res) => {
//   try {
//     const existing = await Footer.findById(req.params.id);
//     if (!existing) return sendResponse(res, false, null, "Footer not found");

//     if (req.user.role === "store_owner") {
//       }
//     }

//     const data = { ...req.body };
//     if (req.user.role === "store_owner") {
//     }

//     const updatedFooter = await Footer.findByIdAndUpdate(req.params.id, data, { new: true });
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

//     const existing = await Footer.findById(id);
//     if (!existing) return sendResponse(res, false, null, "Footer not found");

//     if (req.user.role === "store_owner") {
//       }
//     }

//     const footer = await Footer.findByIdAndUpdate(id, { status }, { new: true });
//     sendResponse(res, true, footer, "Footer status updated successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ─── DELETE ───────────────────────────────────────────────────────────────────
// const deleteFooter = async (req, res) => {
//   try {
//     const existing = await Footer.findById(req.params.id);
//     if (!existing) return sendResponse(res, false, null, "Footer not found");

//     if (req.user.role === "store_owner") {
//     }

//     await Footer.findByIdAndDelete(req.params.id);
//     sendResponse(res, true, null, "Footer deleted successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

// // ─── BULK DELETE ──────────────────────────────────────────────────────────────
// const bulkDeleteFooters = async (req, res) => {
//   try {
//     const { ids } = req.body;
//     if (!Array.isArray(ids) || ids.length === 0)
//       return sendResponse(res, false, null, "No IDs provided");

//     const deleteQuery = { _id: { $in: ids } };

//     // store_owner can only bulk-delete their own store's footers
//     if (req.user.role === "store_owner") {
//     }

//     const result = await Footer.deleteMany(deleteQuery);
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
//   updateFooterStatus,
// };

const Footer = require("../models/Footer");
const { sendResponse } = require("../utils/response");

// GET ALL
const getFooters = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      isDownload = "false",
    } = req.query;

    const query = {};

    if (search) {
      query.label = {
        $regex: search,
        $options: "i",
      };
    }

    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    const download = isDownload === "true";

    if (download) {
      const footers = await Footer.find(query).sort({
        createdAt: -1,
      });

      return sendResponse(
        res,
        true,
        { footers },
        "All footers retrieved successfully",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Footer.countDocuments(query);

    const footers = await Footer.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return sendResponse(
      res,
      true,
      {
        footers,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      "Footers retrieved successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

// GET BY ID
const getFooterById = async (req, res) => {
  try {
    const footer = await Footer.findById(req.params.id);

    if (!footer) {
      return sendResponse(res, false, null, "Footer not found");
    }

    return sendResponse(res, true, footer, "Footer retrieved successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

// CREATE
const createFooter = async (req, res) => {
  try {
    const footer = await Footer.create({
      label: req.body.label,
      url: req.body.url,
      status: req.body.status || "active",
    });

    return sendResponse(res, true, footer, "Footer created successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

// UPDATE
const updateFooter = async (req, res) => {
  try {
    const footer = await Footer.findById(req.params.id);

    if (!footer) {
      return sendResponse(res, false, null, "Footer not found");
    }

    const updatedFooter = await Footer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return sendResponse(
      res,
      true,
      updatedFooter,
      "Footer updated successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

// UPDATE STATUS
const updateFooterStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status");
    }

    const footer = await Footer.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        returnDocument: "after",
      },
    );

    if (!footer) {
      return sendResponse(res, false, null, "Footer not found");
    }

    return sendResponse(
      res,
      true,
      footer,
      "Footer status updated successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

// DELETE
const deleteFooter = async (req, res) => {
  try {
    const footer = await Footer.findByIdAndDelete(req.params.id);

    if (!footer) {
      return sendResponse(res, false, null, "Footer not found");
    }

    return sendResponse(res, true, null, "Footer deleted successfully");
  } catch (error) {
    return sendResponse(res, false, null, error.message);
  }
};

// BULK DELETE
const bulkDeleteFooters = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return sendResponse(res, false, null, "Please provide ids");
    }

    const result = await Footer.deleteMany({
      _id: { $in: ids },
    });

    return sendResponse(
      res,
      true,
      {
        deletedCount: result.deletedCount,
      },
      "Footers deleted successfully",
    );
  } catch (error) {
    return sendResponse(res, false, null, error.message);
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

const Navbar = require("../models/Navbar");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getPublicNavbars = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const navbars = await Navbar.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ order: 1 });

    res.json({ success: true, data: navbars });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getNavbars = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false", status } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const query = {};
    if (search) query.label = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status)) query.status = status;

    applyOwnershipFilter(req, query);

    if (download) {
      const navbars = await Navbar.find(query).sort({ order: 1 });
      return sendResponse(res, true, { navbars }, "All navbars retrieved for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Navbar.countDocuments(query);
    const navbars = await Navbar.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ order: 1 });

    sendResponse(res, true, {
      navbars,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getNavbarById = async (req, res) => {
  try {
    const navbar = await Navbar.findById(req.params.id);
    if (!navbar) return sendResponse(res, false, null, "Navbar not found");
    sendResponse(res, true, navbar, "Navbar retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createNavbar = async (req, res) => {
  try {
    const { label, url, icon, order, status } = req.body;

    if (!label || !url) {
      return res.status(400).json({ success: false, message: "Label and URL are required" });
    }

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const image_url = req.file ? `/uploads/navbar/${req.file.filename}` : null;

    const navbar = new Navbar({
      label,
      url,
      icon: icon || "",
      order: order || 0,
      status: status || "active",
      image_url,
      storeId,
    });

    const savedNavbar = await navbar.save();
    sendResponse(res, true, savedNavbar, "Navbar created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateNavbar = async (req, res) => {
  try {
    const { label, url, icon, order, status } = req.body;

    const updateData = {
      label,
      url,
      icon: icon || "",
      order,
      status: status || "active",
    };

    if (req.file) {
      updateData.image_url = `/uploads/navbar/${req.file.filename}`;
    }

    const updatedNavbar = await Navbar.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedNavbar) return sendResponse(res, false, null, "Navbar not found");
    sendResponse(res, true, updatedNavbar, "Navbar updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateNavbarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const navbar = await Navbar.findByIdAndUpdate(id, { status }, { new: true });
    if (!navbar) return sendResponse(res, false, null, "Navbar not found");

    sendResponse(res, true, navbar, "Navbar status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteNavbar = async (req, res) => {
  try {
    const deletedNavbar = await Navbar.findByIdAndDelete(req.params.id);
    if (!deletedNavbar) return sendResponse(res, false, null, "Navbar not found");
    sendResponse(res, true, null, "Navbar deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteNavbars = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) return sendResponse(res, false, null, "No IDs provided");

    const result = await Navbar.deleteMany({ _id: { $in: ids } });
    sendResponse(res, true, { deletedCount: result.deletedCount }, "Navbars deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getNavbars,
  getPublicNavbars,
  getNavbarById,
  createNavbar,
  updateNavbar,
  deleteNavbar,
  bulkDeleteNavbars,
  updateNavbarStatus,
};
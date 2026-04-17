const { default: slugify } = require("slugify");
const SubCategory = require("../models/Subcategory");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getAllsubCategories = async (req, res) => {
  try {
    // ✅ storeFilter null = unknown domain = no data
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const filter = {
      status: "active",
      storeId: req.storeFilter.storeId,
    };

    const subcategories = await SubCategory.find(filter)
      .select("_id name slug image_url parent_id status storeId")
      .populate("parent_id", "_id name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subcategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN / STORE_OWNER DASHBOARD
// ═══════════════════════════════════════════════════════════════════
const getsubCategories = async (req, res) => {
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
      const subcategories = await SubCategory.find(query)
        .sort({ createdAt: -1 })
        .populate("parent_id", "name");
      return sendResponse(res, true, { categories: subcategories }, "All subcategories retrieved for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await SubCategory.countDocuments(query);
    const subcategories = await SubCategory.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("parent_id", "name");

    sendResponse(res, true, { categories: subcategories, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getsubCategoryById = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id).populate("parent_id", "_id name");
    if (!subcategory) return sendResponse(res, false, null, "SubCategory not found");
    sendResponse(res, true, subcategory, "SubCategory retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// CREATE — storeId auto set
// ═══════════════════════════════════════════════════════════════════
const createsubCategory = async (req, res) => {
  const { name, slug, parent_id, image, status, description } = req.body;

  if (!name)
    return res.status(400).json({ success: false, message: "Name is required" });

  if (!parent_id)
    return res.status(400).json({ success: false, message: "Parent category is required" });

  const image_url = req.file ? `/uploads/${req.file.filename}` : image || null;

  const storeId =
    req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

  const subcategoryData = {
    name,
    slug: slug || slugify(name, { lower: true, strict: true }),
    parent_id,
    image_url,
    description: description || "",
    status: status || "active",
    createdBy: req.user._id,
    storeId,
  };

  try {
    const subcategory = new SubCategory(subcategoryData);
    const savedSubCategory = await subcategory.save();
    sendResponse(res, true, savedSubCategory, "SubCategory created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatesubCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (!updateData.parent_id)
      return sendResponse(res, false, null, "Parent category is required");

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image_url = req.body.image;
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    ).populate("parent_id", "_id name");

    if (!updatedSubCategory)
      return sendResponse(res, false, null, "SubCategory not found");

    sendResponse(res, true, updatedSubCategory, "SubCategory updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatesubCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const subcategory = await SubCategory.findByIdAndUpdate(id, { status }, { new: true });
    if (!subcategory) return sendResponse(res, false, null, "SubCategory not found");

    sendResponse(res, true, subcategory, "SubCategory status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deletesubCategory = async (req, res) => {
  try {
    const deletedSubCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!deletedSubCategory)
      return sendResponse(res, false, null, "SubCategory not found");
    sendResponse(res, true, null, "SubCategory deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeletesubCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await SubCategory.deleteMany({ _id: { $in: ids } });
    sendResponse(res, true, { deletedCount: result.deletedCount }, "SubCategories deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getsubCategories,
  getsubCategoryById,
  createsubCategory,
  updatesubCategory,
  deletesubCategory,
  bulkDeletesubCategories,
  getAllsubCategories,
  updatesubCategoryStatus,
};
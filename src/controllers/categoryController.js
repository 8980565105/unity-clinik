
const slugify = require("slugify");
const Category = require("../models/Category");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getAllCategories = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const filter = {
      status: "active",
      storeId: req.storeFilter.storeId,
    };

    const categories = await Category.find(filter)
      .select("_id name slug image_url parent_id status storeId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
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
      const categories = await Category.find(query)
        .sort({ createdAt: -1 })
        .populate("parent_id", "name");
      return sendResponse(res, true, { categories }, "All categories retrieved for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, { categories, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return sendResponse(res, false, null, "Category not found");
    sendResponse(res, true, category, "Category retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCategory = async (req, res) => {
  const { name, slug, image, status, description } = req.body;

  if (!name)
    return res.status(400).json({ success: false, message: "Name is required" });

  const image_url = req.file ? `/uploads/${req.file.filename}` : image || null;

  const storeId =
    req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

  const categoryData = {
    name,
    slug: slug || slugify(name, { lower: true, strict: true }),
    image_url,
    description: description || "",
    status: status || "active",
    createdBy: req.user._id,
    storeId,
  };

  try {
    const category = new Category(categoryData);
    const savedCategory = await category.save();
    sendResponse(res, true, savedCategory, "Category created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image_url = req.body.image;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedCategory)
      return sendResponse(res, false, null, "Category not found");

    sendResponse(res, true, updatedCategory, "Category updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const category = await Category.findByIdAndUpdate(id, { status }, { new: true });
    if (!category) return sendResponse(res, false, null, "Category not found");

    sendResponse(res, true, category, "Category status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory)
      return sendResponse(res, false, null, "Category not found");
    sendResponse(res, true, null, "Category deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Category.deleteMany({ _id: { $in: ids } });
    sendResponse(res, true, { deletedCount: result.deletedCount }, "Categories deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  getAllCategories,
  updateCategoryStatus,
};
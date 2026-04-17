const { default: slugify } = require("slugify");
const Brand = require("../models/Brand");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getPublicBrands = async (req, res) => {
  try {
    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({ success: true, data: [] });
    }

    const brands = await Brand.find({
      status: "active",
      storeId: req.storeFilter.storeId,
    }).sort({ name: 1 });

    res.json({ success: true, data: brands });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getBrands = async (req, res) => {
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
      const brands = await Brand.find(query).sort({ name: 1 });
      return sendResponse(
        res,
        true,
        { brands },
        "All brands retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Brand.countDocuments(query);
    const brands = await Brand.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    sendResponse(res, true, {
      brands,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return sendResponse(res, false, null, "Brand not found");
    sendResponse(res, true, brand, "Brand retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createBrand = async (req, res) => {
  const { name, slug, image, status, description } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });

  const image_url = req.file ? `/uploads/${req.file.filename}` : image || null;

  const storeId =
    req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

  const brandData = {
    name,
    slug: slug || slugify(name, { lower: true, strict: true }),
    image_url,
    description: description || "",
    status: status || "active",
    createdBy: req.user._id,
    storeId, // ✅ KEY
  };

  try {
    const brand = new Brand(brandData);
    const savedBrand = await brand.save();
    sendResponse(res, true, savedBrand, "Brand created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateBrand = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image_url = req.body.image;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedBrand) return sendResponse(res, false, null, "Brand not found");
    sendResponse(res, true, updatedBrand, "Brand updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateBrandStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status value");

    const brand = await Brand.findByIdAndUpdate(id, { status }, { new: true });
    if (!brand) return sendResponse(res, false, null, "Brand not found");

    sendResponse(res, true, brand, "Brand status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteBrand = async (req, res) => {
  try {
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
    if (!deletedBrand) return sendResponse(res, false, null, "Brand not found");
    sendResponse(res, true, null, "Brand deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteBrands = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Brand.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Brands deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getBrands,
  getPublicBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands,
  updateBrandStatus,
};

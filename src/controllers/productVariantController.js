const ProductVariant = require("../models/ProductVariant");
const { sendResponse } = require("../utils/response");

const getVariants = async (req, res) => {
  try {
    const { product_id } = req.params;
    const variants = await ProductVariant.find({ product_id });
    return sendResponse(
      res,
      true,
      variants,
      "Product variants retrieved successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const createVariants = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { variants } = req.body; 
    if (!variants || !Array.isArray(variants) || variants.length === 0)
      return sendResponse(res, false, null, "No variants provided");

    const variantsToInsert = variants.map((v) => ({ ...v, product_id }));
    const createdVariants = await ProductVariant.insertMany(variantsToInsert);

    return sendResponse(
      res,
      true,
      createdVariants,
      "Product variants created successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const updateVariant = async (req, res) => {
  try {
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedVariant)
      return sendResponse(res, false, null, "Variant not found");
    return sendResponse(
      res,
      true,
      updatedVariant,
      "Variant updated successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const deleteVariant = async (req, res) => {
  try {
    const deletedVariant = await ProductVariant.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedVariant)
      return sendResponse(res, false, null, "Variant not found");
    return sendResponse(res, true, null, "Variant deleted successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteVariants = async (req, res) => {
  try {
    const { ids } = req.body; 
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await ProductVariant.deleteMany({ _id: { $in: ids } });
    return sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Variants deleted successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getVariants,
  createVariants,
  updateVariant,
  deleteVariant,
  bulkDeleteVariants,
};

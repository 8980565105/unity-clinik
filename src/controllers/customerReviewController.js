const CustomerReview = require("../models/CustomerReview");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");

const getReviews = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      is_approved,
    } = req.query;

    const download = isDownload.toLowerCase() === "true";
    const userRole = req.user?.role;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (is_approved === "true") query.is_approved = true;
    else if (is_approved === "false") query.is_approved = false;

    if (userRole === "admin") {
    } else if (userRole === "store_owner") {
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }

    if (download) {
      const customerReviews = await CustomerReview.find(query)
        .populate("user_id", "name email")
        .populate("product_id", "name images")
        .sort({ createdAt: -1 });

      return sendResponse(
        res,
        true,
        { customerReviews },
        "All reviews retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await CustomerReview.countDocuments(query);
    const customerReviews = await CustomerReview.find(query)
      .populate("user_id", "name email")
      .populate("product_id", "name images")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      customerReviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await CustomerReview.findById(req.params.id)
      .populate("user_id", "name email")
      .populate("product_id", "name images");

    if (!review) return sendResponse(res, false, null, "Review not found");
    sendResponse(res, true, review, "Review retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createReview = async (req, res) => {
  try {
    const {
      product_id,
      user_id,
      rating,
      title,
      comment,
      is_approved,
      beforeImage,
      afterImage,
      createdAt,
    } = req.body;

    if (!product_id) {
      return sendResponse(res, false, null, "product_id is required");
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return sendResponse(res, false, null, "Product not found");
    }

    const isAdminOrOwner =
      req.user?.role === "admin" || req.user?.role === "store_owner";

    const resolvedUserId = isAdminOrOwner
      ? user_id || req.user._id
      : req.user._id;

    if (!resolvedUserId) {
      return sendResponse(res, false, null, "user_id is required");
    }

    const reviewData = {
      user_id: resolvedUserId,
      product_id,
      rating,
      title,
      comment,
      is_approved: is_approved ?? false,
      beforeImage,
      afterImage,
      createdAt: isAdminOrOwner && createdAt ? new Date(createdAt) : new Date(),
      updatedAt: new Date(),
    };

    const review = new CustomerReview(reviewData);
    const savedReview = await review.save();

    sendResponse(res, true, savedReview, "Review submitted successfully.");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateReview = async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };

    if (updateData.createdAt) {
      updateData.createdAt = new Date(updateData.createdAt);
    }

    const updatedReview = await CustomerReview.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    )
      .populate("user_id", "name email")
      .populate("product_id", "name images");

    if (!updatedReview)
      return sendResponse(res, false, null, "Review not found");
    sendResponse(res, true, updatedReview, "Review updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    if (typeof is_approved !== "boolean") {
      return sendResponse(res, false, null, "is_approved must be a boolean");
    }

    const review = await CustomerReview.findById(id);
    if (!review) return sendResponse(res, false, null, "Review not found");

    const updated = await CustomerReview.findByIdAndUpdate(
      id,
      { is_approved, updatedAt: new Date() },
      { new: true },
    );

    sendResponse(res, true, updated, "Review status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await CustomerReview.findById(req.params.id);
    if (!review) return sendResponse(res, false, null, "Review not found");

    await CustomerReview.findByIdAndDelete(req.params.id);
    sendResponse(res, true, null, "Review deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteReviews = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await CustomerReview.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Reviews deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicReviewsByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    if (!product_id) {
      return sendResponse(res, false, null, "product_id is required");
    }

    const query = { product_id, is_approved: true };

    const total = await CustomerReview.countDocuments(query);
    const reviews = await CustomerReview.find(query)
      .populate("user_id", "name")
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { is_approved: true };

    const total = await CustomerReview.countDocuments(query);
    const customerReviews = await CustomerReview.find(query)
      .populate("user_id", "name")
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      customerReviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  bulkDeleteReviews,
  updateReviewStatus,
  getPublicReviewsByProduct,
  getPublicReviews,
};

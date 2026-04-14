const CustomerReview = require("../models/CustomerReview");
const Product = require("../models/Product");
const Store = require("../models/Store");
const { sendResponse } = require("../utils/response");
const { resolveStoreByDomain } = require("../config/domainResolver");

const extractDomain = (req) => {
  try {
    const origin = req.headers.origin || "";
    if (origin) {
      const url = new URL(origin);
      return url.host;
    }
    return req.headers.host?.toLowerCase() || "";
  } catch {
    return req.headers.host?.toLowerCase() || "";
  }
};

const resolveStoreId = async (req) => {
  try {
    if (req.user?.storeId) return req.user.storeId;

    const domain = extractDomain(req);
    if (domain) {
      const storeId = await resolveStoreByDomain(domain);
      if (storeId) return storeId;
    }

    return null;
  } catch (e) {
    console.error("resolveStoreId error:", e.message);
    return null;
  }
};

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
    const userId = req.user?._id;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (is_approved === "true") query.is_approved = true;
    else if (is_approved === "false") query.is_approved = false;

    if (userRole === "admin") {
    } else if (userRole === "store_owner") {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return sendResponse(
          res,
          false,
          null,
          "No storeId found for this owner",
        );
      }
      query.storeId = storeId;
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

    if (
      req.user?.role === "store_owner" &&
      review.storeId?.toString() !== req.user.storeId?.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your review");
    }

    sendResponse(res, true, review, "Review retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createReview = async (req, res) => {
  try {
    const { product_id, rating, title, comment, is_approved } = req.body;

    if (!product_id) {
      return sendResponse(res, false, null, "product_id is required");
    }

    let storeId = null;
    try {
      const product =
        await Product.findById(product_id).select("storeId createdBy");
      if (product?.storeId) {
        storeId = product.storeId;
      } else {
        const domain = extractDomain(req);
        if (domain) {
          const resolvedId = await resolveStoreByDomain(domain);
          if (resolvedId) storeId = resolvedId;
        }
      }
    } catch (e) {
      console.error("storeId resolve failed:", e.message);
    }

    const review = new CustomerReview({
      user_id: req.user?._id,
      product_id,
      storeId,
      rating,
      title,
      comment,
      is_approved: is_approved !== undefined ? is_approved : false,
    });

    const savedReview = await review.save();
    sendResponse(res, true, savedReview, "Review submitted successfully.");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateReview = async (req, res) => {
  try {
    const updatedReview = await CustomerReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
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

    if (
      req.user?.role === "store_owner" &&
      review.storeId?.toString() !== req.user.storeId?.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your review");
    }

    const updated = await CustomerReview.findByIdAndUpdate(
      id,
      { is_approved },
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

    if (
      req.user?.role === "store_owner" &&
      review.storeId?.toString() !== req.user.storeId?.toString()
    ) {
      return sendResponse(res, false, null, "Forbidden: Not your review");
    }

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

    const query = {
      product_id,
      is_approved: true,
    };

    const total = await CustomerReview.countDocuments(query);
    const reviews = await CustomerReview.find(query)
      .populate("user_id", "name")
      .select("-storeId")
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

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  bulkDeleteReviews,
  updateReviewStatus,
  getPublicReviewsByProduct,
};

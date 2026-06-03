const express = require("express");
const router = express.Router();
const {
  getReviews,
  getReviewById,
  getPublicReviews,
  createReview,
  updateReview,
  deleteReview,
  bulkDeleteReviews,
  updateReviewStatus,
  getPublicReviewsByProduct,
} = require("../controllers/customerReviewController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/product/:product_id", getPublicReviewsByProduct);
router.get("/public", getPublicReviews);
router.use(authMiddleware);
router.post("/", createReview);
router.get("/", authorizeMinRole("admin"), getReviews);
router.get("/:id", authorizeMinRole("admin"), getReviewById);
router.put("/:id", authorizeMinRole("admin"), updateReview);
router.put("/:id/status", authorizeMinRole("admin"), updateReviewStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteReview);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteReviews);
module.exports = router;

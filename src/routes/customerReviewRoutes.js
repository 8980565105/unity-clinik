const express = require("express");
const router = express.Router();
const {
  getReviews,
  getReviewById,
<<<<<<< HEAD
  getPublicReviews,
=======
>>>>>>> fe887d7bf29e4195a4ae74254b104258eeda54b5
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
<<<<<<< HEAD
router.get("/public", getPublicReviews);
=======
>>>>>>> fe887d7bf29e4195a4ae74254b104258eeda54b5

router.use(authMiddleware);
router.post("/", createReview);
router.get("/", authorizeMinRole("store_owner"), getReviews);
router.get("/:id", authorizeMinRole("store_owner"), getReviewById);
router.put("/:id", authorizeMinRole("store_owner"), updateReview);
router.put("/:id/status", authorizeMinRole("store_owner"), updateReviewStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteReview);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteReviews);
module.exports = router;

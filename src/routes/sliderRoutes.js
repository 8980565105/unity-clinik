const express = require("express");
const router = express.Router();

const {
  getPublicSlider,
  getSlides,
  getSlideById,
  createSlide,
  updateSlide,
  updateSlideStatus,
  deleteSlide,
  bulkDeleteSlides,
} = require("../controllers/sliderController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getPublicSlider);
router.use(authMiddleware);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteSlides);
router.get("/", authorizeMinRole("store_owner"), getSlides);
router.get("/:id", authorizeMinRole("store_owner"), getSlideById);
router.post("/", authorizeMinRole("store_owner"), createSlide);
router.put("/:id", authorizeMinRole("store_owner"), updateSlide);
router.put("/:id/status", authorizeMinRole("store_owner"), updateSlideStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteSlide);

module.exports = router;

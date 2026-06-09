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
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteSlides);
router.get("/", authorizeMinRole("admin"), getSlides);
router.get("/:id", authorizeMinRole("admin"), getSlideById);
router.post("/", authorizeMinRole("admin"), createSlide);
router.put("/:id", authorizeMinRole("admin"), updateSlide);
router.put("/:id/status", authorizeMinRole("admin"), updateSlideStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteSlide);

module.exports = router;

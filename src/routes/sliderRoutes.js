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
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicSlider);

router.use(authMiddleware);

router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteSlides);

router.get(
  "/",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  getSlides,
);
router.get("/:id", authorizeMinRole("store_owner"), getSlideById);
router.post("/", authorizeMinRole("store_owner"), createSlide);
router.put("/:id", authorizeMinRole("store_owner"), updateSlide);
router.put("/:id/status", authorizeMinRole("store_owner"), updateSlideStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteSlide);

module.exports = router;

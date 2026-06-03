
const express = require("express");
const router = express.Router();

const {
  getBrands,
  getPublicBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands,
  updateBrandStatus,
} = require("../controllers/brandController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter, 
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

const upload = require("../middlewares/upload");

router.get("/public", injectPublicStoreFilter, getPublicBrands);

router.use(authMiddleware);

router.get("/", injectOwnershipFilter, getBrands);

router.get("/:id",authorizeMinRole("admin"), getBrandById);
router.post(
  "/",
  authorizeMinRole("admin"),
  upload.single("image"),
  createBrand,
);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  upload.single("image"),
  updateBrand,
);
router.put("/:id/status", authorizeMinRole("admin"), updateBrandStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteBrand);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteBrands);

module.exports = router;

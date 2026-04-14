
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

router.get("/:id",authorizeMinRole("store_owner"), getBrandById);
router.post(
  "/",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  createBrand,
);
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  updateBrand,
);
router.put("/:id/status", authorizeMinRole("store_owner"), updateBrandStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteBrand);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteBrands);

module.exports = router;

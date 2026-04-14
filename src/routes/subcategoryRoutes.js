
const express = require("express");
const router = express.Router();
const {
  getsubCategories,
  getsubCategoryById,
  createsubCategory,
  updatesubCategory,
  deletesubCategory,
  bulkDeletesubCategories,
  getAllsubCategories,
  updatesubCategoryStatus,
} = require("../controllers/subcategoryController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter, 
  injectOwnershipFilter, 
} = require("../middlewares/ownershipFilter");
const upload = require("../middlewares/upload");

router.get("/public", injectPublicStoreFilter, getAllsubCategories);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getsubCategories);
router.get("/all", injectPublicStoreFilter, getAllsubCategories);
router.get("/:id", authorizeMinRole("store_owner"), getsubCategoryById);
router.post(
  "/",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  createsubCategory,
);
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  updatesubCategory,
);
router.put(
  "/:id/status",
  authorizeMinRole("store_owner"),
  updatesubCategoryStatus,
);
router.delete("/:id", authorizeMinRole("store_owner"), deletesubCategory);
router.post(
  "/bulk-delete",
  authorizeMinRole("store_owner"),
  bulkDeletesubCategories,
);

module.exports = router;

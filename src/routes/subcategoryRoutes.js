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
  reorderSubCategories,
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
router.put("/reorder/bulk", authorizeMinRole("admin"), reorderSubCategories);
router.get("/:id", authorizeMinRole("admin"), getsubCategoryById);
router.post(
  "/",
  authorizeMinRole("admin"),
  upload.single("image"),
  createsubCategory,
);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  upload.single("image"),
  updatesubCategory,
);
router.put("/:id/status", authorizeMinRole("admin"), updatesubCategoryStatus);
router.delete("/:id", authorizeMinRole("admin"), deletesubCategory);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeletesubCategories);

module.exports = router;

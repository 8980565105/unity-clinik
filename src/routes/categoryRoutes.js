const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  bulkDeleteCategories,
  getAllCategories,
  updateCategoryStatus,
} = require("../controllers/categoryController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const upload = require("../middlewares/upload");

router.get("/public", getAllCategories);
router.use(authMiddleware);
router.get("/", getCategories);
router.get("/all", getAllCategories);
router.put("/reorder/bulk", authorizeMinRole("admin"), reorderCategories);
router.get("/:id", authorizeMinRole("admin"), getCategoryById);
router.post(
  "/",
  authorizeMinRole("admin"),
  upload.single("image"),
  createCategory,
);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  upload.single("image"),
  updateCategory,
);
router.put("/:id/status", authorizeMinRole("admin"), updateCategoryStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteCategory);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteCategories);

module.exports = router;

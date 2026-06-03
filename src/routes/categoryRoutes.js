
const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  getAllCategories,
  updateCategoryStatus,
} = require("../controllers/categoryController");

const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,  
  injectOwnershipFilter,    
} = require("../middlewares/ownershipFilter");
const upload = require("../middlewares/upload");

router.get("/public", injectPublicStoreFilter, getAllCategories);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getCategories);
router.get("/all", injectPublicStoreFilter, getAllCategories);
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
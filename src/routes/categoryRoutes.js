
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
router.get("/:id", authorizeMinRole("store_owner"), getCategoryById);
router.post(
  "/",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  createCategory,
);
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  updateCategory,
);
router.put("/:id/status", authorizeMinRole("store_owner"), updateCategoryStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteCategory);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteCategories);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getPublicProducts,
  getPublicProductById,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
  reorderProducts,
} = require("../controllers/productController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const upload = require("../middlewares/upload");

router.get("/public", getPublicProducts);
router.get("/public/:id", getPublicProductById);
router.use(authMiddleware);
router.get("/", getProducts);
router.put("/reorder/bulk", authorizeMinRole("admin"), reorderProducts);
router.get("/:id", authorizeMinRole("admin"), getProductById);
router.post(
  "/",
  authorizeMinRole("admin"),
  upload.single("image"),
  createProduct,
);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  upload.single("image"),
  updateProduct,
);
router.put("/:id/status", authorizeMinRole("admin"), updateProductStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteProduct);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteProducts);

module.exports = router;

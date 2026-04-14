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
} = require("../controllers/productController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

const upload = require("../middlewares/upload");

router.get("/public", injectPublicStoreFilter, getPublicProducts);
router.get("/public/:id", getPublicProductById);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getProducts);
router.get("/:id", authorizeMinRole("store_owner"), getProductById);
router.post(
  "/",
  authorizeMinRole("store_owner"),
   upload.single("image"),
  createProduct,
);
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
   upload.single("image"),
  updateProduct,
);
router.put("/:id/status", authorizeMinRole("store_owner"), updateProductStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteProduct);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteProducts);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getCarts,
  getCartById,
  getCartByIdentifier,
  createCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  bulkDeleteCartItems,
  mergeGuestCart,
} = require("../controllers/cartController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/by-identifier", getCartByIdentifier);
router.post("/", createCart);
router.post("/add-item", addCartItem);
router.put("/update-item", updateCartItem);
router.delete("/delete-item", deleteCartItem);
router.post("/merge", mergeGuestCart); 

router.use(authMiddleware);
router.get("/", authorizeMinRole("admin"), getCarts);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteCartItems);
router.get("/:id", getCartById);
router.delete("/:id", deleteCart);

module.exports = router;

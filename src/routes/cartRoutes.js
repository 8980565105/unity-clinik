
const express = require("express");
const router = express.Router();
const {
  getCarts,
  getCartById,
  createCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  bulkDeleteCartItems,
} = require("../controllers/cartController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.get("/", authorizeMinRole("store_owner"), getCarts);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteCartItems);
router.get("/:id", getCartById);
router.post("/", createCart);
router.post("/add-item", addCartItem);
router.put("/update-item", updateCartItem);
router.delete("/delete-item", deleteCartItem);
router.delete("/:id", deleteCart);

module.exports = router;
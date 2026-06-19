// const express = require("express");
// const router = express.Router();
// const {
//   getCarts,
//   getCartById,
//   createCart,
//   addCartItem,
//   updateCartItem,
//   deleteCartItem,
//   deleteCart,
//   bulkDeleteCartItems,
// } = require("../controllers/cartController");

// const {
//   authMiddleware,
//   authorizeMinRole,
// } = require("../middlewares/authMiddleware");

// router.use(authMiddleware);
// router.get("/", authorizeMinRole("admin"), getCarts);
// router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteCartItems);
// router.get("/:id", getCartById);
// router.post("/", createCart);
// router.post("/add-item", addCartItem);
// router.put("/update-item", updateCartItem);
// router.delete("/delete-item", deleteCartItem);
// router.delete("/:id", deleteCart);

// module.exports = router;
// routes/cartRoutes.js
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

// ── Public routes (no auth needed) ──────────────────────────────────
router.get("/by-identifier", getCartByIdentifier); // ?guest_id=xxx OR ?user_id=xxx
router.post("/", createCart);
router.post("/add-item", addCartItem);
router.put("/update-item", updateCartItem);
router.delete("/delete-item", deleteCartItem);
router.post("/merge", mergeGuestCart); // call on login

// ── Protected routes ─────────────────────────────────────────────────
router.use(authMiddleware);
router.get("/", authorizeMinRole("admin"), getCarts);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteCartItems);
router.get("/:id", getCartById);
router.delete("/:id", deleteCart);

module.exports = router;

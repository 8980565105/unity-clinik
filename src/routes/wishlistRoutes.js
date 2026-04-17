const express = require("express");
const router = express.Router();
const {
  addItemToWishlist,
  removeItemFromWishlist,
  getWishlistByUser,
  deleteWishlistItem,
  getWishlist,
  bulkDeleteWishlistItems,
} = require("../controllers/wishlistController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
router.use(authMiddleware);
router.get("/", authorizeMinRole("store_owner"), getWishlist);
router.get("/user/:user_id", getWishlistByUser);
router.post("/items", addItemToWishlist);
router.delete("/items", removeItemFromWishlist);
router.delete("/:id", deleteWishlistItem);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteWishlistItems);

module.exports = router;

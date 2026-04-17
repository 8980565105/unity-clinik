const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  bulkDeleteStores,
  getMyStore,
  updateMyStore,
  getStoreByDomain,
} = require("../controllers/storeController");

router.get("/info", getStoreByDomain);
router.use(authMiddleware);

router.get("/my", authorizeMinRole("store_owner"), getMyStore);
router.put("/my", authorizeMinRole("store_owner"), updateMyStore);

router.get("/", authorizeMinRole("store_owner"), getStores);
router.get("/:id", authorizeMinRole("store_owner"), getStoreById);
router.post("/", authorizeMinRole("store_owner"), createStore);
router.put("/:id", authorizeMinRole("store_owner"), updateStore);
router.delete("/:id", authorizeMinRole("store_owner"), deleteStore);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteStores);

module.exports = router;

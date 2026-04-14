const express = require("express");
const router = express.Router();
const {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  bulkDeleteWarehouses,
  updateWarehouseStatus,
} = require("../controllers/warehouseController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.get("/", authorizeMinRole("store_owner"), getWarehouses);
router.get("/:id", authorizeMinRole("store_owner"), getWarehouseById);
router.post("/", authorizeMinRole("store_owner"), createWarehouse);
router.put("/:id", authorizeMinRole("store_owner"), updateWarehouse);
router.put(
  "/:id/status",
  authorizeMinRole("store_owner"),
  updateWarehouseStatus,
);
router.delete("/:id", authorizeMinRole("store_owner"), deleteWarehouse);
router.post(
  "/bulk-delete",
  authorizeMinRole("store_owner"),
  bulkDeleteWarehouses,
);

module.exports = router;

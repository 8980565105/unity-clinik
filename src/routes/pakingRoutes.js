const express = require("express");
const router = express.Router();

const {
  getPacking,
  getPackingById,
  createPacking,
  updatePacking,
  deletePacking,
  bulkDeletePacking,
  updatePackingStatus,
} = require("../controllers/pakingController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/", getPacking);

router.use(authMiddleware);

router.get("/:id", authorizeMinRole("admin"), getPackingById);
router.post("/", authorizeMinRole("admin"), createPacking);
router.put("/:id", authorizeMinRole("admin"), updatePacking);
router.put("/:id/status", authorizeMinRole("admin"), updatePackingStatus);
router.delete("/:id", authorizeMinRole("admin"), deletePacking);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeletePacking);

module.exports = router;

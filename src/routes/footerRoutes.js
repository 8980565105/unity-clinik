const express = require("express");
const router = express.Router();
const {
  getFooters,
  getFooterById,
  createFooter,
  updateFooter,
  deleteFooter,
  bulkDeleteFooters,
  updateFooterStatus,
} = require("../controllers/footerController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getFooters);

router.use(authMiddleware);

router.get("/", authorizeMinRole("user"), getFooters);

router.get("/:id", authorizeMinRole("user"), getFooterById);

router.post("/", authorizeMinRole("admin"), createFooter);

router.put("/:id", authorizeMinRole("admin"), updateFooter);

router.put("/:id/status", authorizeMinRole("admin"), updateFooterStatus);

router.delete("/:id", authorizeMinRole("admin"), deleteFooter);

router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteFooters);

module.exports = router;

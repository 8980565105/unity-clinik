const express = require("express");
const router = express.Router();
const {
  getNavbars,
  getPublicNavbars,
  getNavbarById,
  createNavbar,
  updateNavbar,
  deleteNavbar,
  bulkDeleteNavbars,
  updateNavbarStatus,
  reorderNavbars,
} = require("../controllers/navbarController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.get("/public", getPublicNavbars);
router.use(authMiddleware);
router.get("/", getNavbars);
router.put("/reorder/bulk", authorizeMinRole("admin"), reorderNavbars);
router.get("/:id", authorizeMinRole("admin"), getNavbarById);
router.post(
  "/",
  authorizeMinRole("admin"),
  upload.single("image"),
  createNavbar,
);
router.put(
  "/:id",
  authorizeMinRole("admin"),
  upload.single("image"),
  updateNavbar,
);
router.put("/:id/status", authorizeMinRole("admin"), updateNavbarStatus);
router.delete("/:id", authorizeMinRole("admin"), deleteNavbar);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteNavbars);

module.exports = router;

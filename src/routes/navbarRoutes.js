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
} = require("../controllers/navbarController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicNavbars);
router.use(authMiddleware);
router.get("/", injectOwnershipFilter, getNavbars);
router.get("/:id", authorizeMinRole("store_owner"), getNavbarById);
router.post(
  "/",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  createNavbar,
);
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
  upload.single("image"),
  updateNavbar,
);
router.put("/:id/status", authorizeMinRole("store_owner"), updateNavbarStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteNavbar);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteNavbars);

module.exports = router;

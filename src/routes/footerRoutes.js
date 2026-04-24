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
const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

// ── PUBLIC route: domain-based store filter (no auth needed)
// Used by the storefront Footer.jsx component
router.get("/public", injectPublicStoreFilter, getFooters);

// ── PROTECTED routes ─────────────────────────────────────────────────────────
router.use(authMiddleware);

// GET all — admin sees all, store_owner sees only their store
// authorizeMinRole("store_owner") means store_owner OR admin can access
router.get(
  "/",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  getFooters,
);

// GET by id
router.get(
  "/:id",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  getFooterById,
);

// CREATE — store_owner adds footer auto-tagged to their storeId
router.post(
  "/",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  createFooter,
);

// UPDATE
router.put(
  "/:id",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  updateFooter,
);

// UPDATE STATUS
router.put(
  "/:id/status",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  updateFooterStatus,
);

// DELETE
router.delete(
  "/:id",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  deleteFooter,
);

// BULK DELETE
router.post(
  "/bulk-delete",
  authorizeMinRole("store_owner"),
  injectOwnershipFilter,
  bulkDeleteFooters,
);

module.exports = router;

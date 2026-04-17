const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectPublicStoreFilter,
  injectOwnershipFilter,
} = require("../middlewares/ownershipFilter");

const {
  getPages,
  getPageById,
  createPage,
  updatePage,
  updatePageStatus,
  deletePage,
  bulkDeletePages,
  getPageBySlug,
} = require("../controllers/pageController");

router.get("/get/:slug", injectPublicStoreFilter, getPageBySlug);

router.use(authMiddleware, injectOwnershipFilter);

router.get("/", authorizeMinRole("store_owner"), getPages);
router.get("/:id", authorizeMinRole("store_owner"), getPageById);
router.post("/", authorizeMinRole("store_owner"), createPage);
router.put("/:id", authorizeMinRole("store_owner"), updatePage);
router.put("/:id/status", authorizeMinRole("store_owner"), updatePageStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deletePage);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeletePages);

module.exports = router;

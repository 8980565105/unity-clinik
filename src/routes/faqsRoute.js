const express = require("express");
const router = express.Router();

const {
  getfaqs,
  getPublicFaqs,
  deletefaqs,
  bulkDeletefaqs,
  getFaqBanner,
  createfaqs,
  getfaqsById,
  saveFaqBanner,
  updatefaqs,
  updatefaqsStatus,
} = require("../controllers/faqsController");

const upload = require("../middlewares/upload");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  injectOwnershipFilter,
  injectPublicStoreFilter,
} = require("../middlewares/ownershipFilter");

router.get("/public", injectPublicStoreFilter, getPublicFaqs);
router.get("/banner/public", injectPublicStoreFilter, getFaqBanner);

router.use(authMiddleware);
// router.post(
//   "/banner",
//   upload.single("image"),
//   authorizeMinRole("store_owner"),
//   saveFaqBanner,
// );

router.post("/banner", upload.single("image"),authorizeMinRole("store_owner"), saveFaqBanner);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeletefaqs);
router.get("/", injectOwnershipFilter, getfaqs);
router.post("/", authorizeMinRole("store_owner"), createfaqs);
router.get("/:id", authorizeMinRole("store_owner"), getfaqsById);
router.put("/:id", authorizeMinRole("store_owner"), updatefaqs);
router.put("/:id/status", authorizeMinRole("store_owner"), updatefaqsStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deletefaqs);

module.exports = router;

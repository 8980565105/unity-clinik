const express = require("express");
const router = express.Router();
const {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  bulkDeleteContacts,
} = require("../controllers/contactUsController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const { injectPublicStoreFilter } = require("../middlewares/ownershipFilter");

router.post("/", injectPublicStoreFilter, createContact);

router.get("/", authMiddleware, authorizeMinRole("admin"), getContacts);
router.get("/:id", authMiddleware, authorizeMinRole("admin"), getContactById);
router.delete("/:id", authMiddleware, authorizeMinRole("admin"), deleteContact);
router.post(
  "/bulk-delete",
  authMiddleware,
  authorizeMinRole("admin"),
  bulkDeleteContacts,
);

module.exports = router;

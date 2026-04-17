

const express = require("express");
const router = express.Router();
const {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  bulkDeleteContacts,
} = require("../controllers/contactUsController");

const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");
const { injectPublicStoreFilter } = require("../middlewares/ownershipFilter");

router.post("/", injectPublicStoreFilter, createContact);

router.get("/", authMiddleware, authorizeMinRole("store_owner"), getContacts);
router.get("/:id", authMiddleware, authorizeMinRole("store_owner"), getContactById);
router.delete("/:id", authMiddleware, authorizeMinRole("store_owner"), deleteContact);
router.post("/bulk-delete", authMiddleware, authorizeMinRole("store_owner"), bulkDeleteContacts);

module.exports = router;
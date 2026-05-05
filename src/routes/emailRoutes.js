const express = require("express");
const router = express.Router();
const {
  getEmail,
  getEmailById,
  createEmails,
  updateEmails,
  deleteEmails,
  bulkDeleteEmails,
  getPublicEmail,
} = require("../controllers/emailController"); 

router.get("/", getEmail);
router.get("/public", getPublicEmail);
router.get("/:id", getEmailById);
router.post("/", createEmails);
router.put("/:id", updateEmails);
router.post("/bulk-delete", bulkDeleteEmails);
router.delete("/:id", deleteEmails);

module.exports = router;
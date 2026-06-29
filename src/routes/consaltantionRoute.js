const express = require("express");
const router = express.Router();
const {
  getConsultationPage,
  getPublicConsultationPage,
  updateConsultationPage,
} = require("../controllers/consaltantionController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

// Public route — frontend use kare
router.get("/public", getPublicConsultationPage);

// Admin routes — auth required
router.use(authMiddleware);
router.get("/", getConsultationPage);
router.put("/", authorizeMinRole("admin"), updateConsultationPage);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getPublicAboutPage,
  getAboutPage,
  updateAboutPage,
} = require("../controllers/aboutpageController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getPublicAboutPage);

router.use(authMiddleware);
router.get("/", getAboutPage);
router.put("/", authorizeMinRole("admin"), updateAboutPage);

module.exports = router;

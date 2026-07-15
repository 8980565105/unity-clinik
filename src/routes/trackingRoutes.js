const express = require("express");
const router = express.Router();
const { trackPageVisit } = require("../controllers/trackingController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/page-visit", authMiddleware, trackPageVisit);

module.exports = router;

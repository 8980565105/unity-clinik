const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizeMinRole("store_owner"), getDashboard);

module.exports = router;

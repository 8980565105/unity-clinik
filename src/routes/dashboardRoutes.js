const express = require("express");
const {
  getDashboard,
  getDashboardcount,
} = require("../controllers/dashboardController");
const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/count", getDashboardcount);
router.use(authMiddleware);

router.get("/", authorizeMinRole("store_owner"), getDashboard);

module.exports = router;

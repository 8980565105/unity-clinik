const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

const {
  getShippingCharge,
  saveShippingCharge,
} = require("../controllers/sippingchargeController");

router.get("/public", getShippingCharge);

router.get("/", authMiddleware, authorizeMinRole("admin"), getShippingCharge);
router.post("/", authMiddleware, authorizeMinRole("admin"), saveShippingCharge);

module.exports = router;

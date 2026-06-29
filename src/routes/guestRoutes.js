const express = require("express");
const router = express.Router();
const { resolveGuestId } = require("../controllers/guestController");

router.post("/resolve", resolveGuestId);

module.exports = router;

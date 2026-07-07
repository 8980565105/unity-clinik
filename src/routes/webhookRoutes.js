const express = require("express");
const router = express.Router();
const { handleIthinkWebhook } = require("../controllers/webhookController");
router.post(
  "/ithink",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body.toString();
    req.body = JSON.parse(req.rawBody);
    next();
  },
  handleIthinkWebhook,
);

module.exports = router;

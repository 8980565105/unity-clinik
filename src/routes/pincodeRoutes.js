const express = require("express");
const router = express.Router();
const { checkPincodeServiceability } = require("../services/ithinkLogistics");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { sendResponse } = require("../utils/response");

router.post("/check", authMiddleware, async (req, res) => {
  const { pincode } = req.body;

  if (!pincode || String(pincode).length !== 6) {
    return sendResponse(res, false, null, "Invalid pincode");
  }

  const result = await checkPincodeServiceability(pincode);

  if (!result.serviceable) {
    return sendResponse(
      res,
      true,
      { serviceable: false },
      "Service not available in your pincode",
    );
  }

  return sendResponse(res, true, result, "Pincode is serviceable");
});

module.exports = router;

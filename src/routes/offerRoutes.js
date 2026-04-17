// const express = require("express");
// const router = express.Router();

// const {
//   createOffer,
//   getOffers,
//   getOfferById,
//   updateOffer,
//   updateOfferStatus,
//   deleteOffer,
//   bulkDeleteOffers,
// } = require("../controllers/offerController");

// const {
//   authMiddleware,
//   authorizeMinRole,
// } = require("../middlewares/authMiddleware");

// router.get("/", getOffers);

// // ⚠️ bulk-delete MUST come before /:id — otherwise "bulk-delete" is treated as an id
// router.post("/bulk-delete", authMiddleware, authorizeMinRole("store_owner"), bulkDeleteOffers);

// router.get("/:id", getOfferById);

// router.use(authMiddleware);

// router.post("/", authorizeMinRole("store_owner"), createOffer);
// router.put("/:id", authorizeMinRole("store_owner"), updateOffer);
// router.put("/:id/status", authorizeMinRole("store_owner"), updateOfferStatus);
// router.delete("/:id", authorizeMinRole("store_owner"), deleteOffer);

// module.exports = router;
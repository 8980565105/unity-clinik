const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  getBookedSlots,
  updateBookingSlot,
  deleteBooking,
  bulkDeleteBookings,
  getGiftEligibility,
} = require("../controllers/bookconsaltansController");
router.get("/slots", getBookedSlots);
router.post("/bulk-delete", bulkDeleteBookings);
router.get("/gift-eligibility", getGiftEligibility);
router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBooking);
router.patch("/:id/slot", updateBookingSlot);
router.delete("/:id", deleteBooking);
module.exports = router;

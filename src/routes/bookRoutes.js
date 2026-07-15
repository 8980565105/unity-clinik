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
  getMyBookings,
  updateBooking,
} = require("../controllers/bookconsaltansController");

router.get("/my-bookings", getMyBookings);
router.get("/slots", getBookedSlots);
router.post("/bulk-delete", bulkDeleteBookings);
router.get("/gift-eligibility", getGiftEligibility);
router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBooking);
router.patch("/:id/slot", updateBookingSlot);
router.delete("/:id", deleteBooking);
router.patch("/:id", updateBooking);

module.exports = router;

const Bookconsaltion = require("../models/Bookconsaltans");
const Payment = require("../models/Payment");
const { sendResponse } = require("../utils/response");

const {
  sendBookingCreatedUser,
  sendBookingCreatedAdmin,
  sendSlotConfirmedUser,
  sendSlotConfirmedAdmin,
  sendBookingUpdatedUser,
  sendBookingUpdatedAdmin,
} = require("../utils/bookingEmailService");

const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      phone,
      type,
      transaction_id,
      amount,
      product_id,
      product_title,
      payment_method,
    } = req.body;
    if (!phone || !type) {
      return sendResponse(res, false, null, "Phone and type are required");
    }
    const booking = await Bookconsaltion.create({
      name: name || null,
      email: email || null,
      phone,
      message: message || null,
      user_id: req.user?._id || req.body.user_id || null,
      type,
      transaction_id,
      amount,
      payment_method: payment_method || "Online",
      product_id: product_id || null,
      product_title: product_title || null,
    });

    if (transaction_id && amount) {
      await Payment.create({
        order_id: null,
        booking_id: booking._id,
        user_id: booking.user_id,
        payment_method: payment_method || "Razorpay",
        amount_paid: amount,
        transaction_id,
        status: "completed",
        type: "book_consultation",
      });
    }

    sendBookingCreatedUser(booking);
    sendBookingCreatedAdmin(booking);
    return sendResponse(res, true, booking, "Booking created successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { transaction_id: { $regex: search, $options: "i" } },
        { product_title: { $regex: search, $options: "i" } },
      ];
    }
    const [bookings, total] = await Promise.all([
      Bookconsaltion.find(query)
        .populate("product_id", "name images price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Bookconsaltion.countDocuments(query),
    ]);
    return sendResponse(res, true, { bookings, total }, "Bookings fetched");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Bookconsaltion.findById(req.params.id).populate(
      "product_id",
      "name images price",
    );
    if (!booking) return sendResponse(res, false, null, "Booking not found");
    return sendResponse(res, true, booking, "Booking fetched");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getBookedSlots = async (req, res) => {
  try {
    const { date, type } = req.query;
    if (!date) {
      return sendResponse(res, false, null, "date query param is required");
    }

    const query = {
      slot_date: date,
      slot_status: "confirmed",
    };
    if (type) {
      query.type = type;
    }
    const bookings = await Bookconsaltion.find(query).select(
      "slot_time type -_id",
    );
    const bookedTimes = bookings.map((b) => b.slot_time);
    return sendResponse(
      res,
      true,
      { date, type: type || "all", bookedTimes },
      "Booked slots fetched",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const updateBookingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slot_date, slot_time, slot_duration } = req.body;
    if (!slot_date || !slot_time || !slot_duration) {
      return sendResponse(
        res,
        false,
        null,
        "slot_date, slot_time and slot_duration are required",
      );
    }
    const [y, m, d] = slot_date.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (dayOfWeek === 0) {
      return sendResponse(
        res,
        false,
        null,
        "Bookings are not available on Sundays",
      );
    }
    const now = new Date();
    const nowY = now.getFullYear();
    const nowM = now.getMonth() + 1;
    const nowD = now.getDate();
    if (y === nowY && m === nowM && d === nowD) {
      const [sh, sm] = slot_time.split(":").map(Number);
      const slotMinutes = sh * 60 + sm;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) {
        return sendResponse(
          res,
          false,
          null,
          "Selected time has already passed, please choose another slot",
        );
      }
    }
    const currentBooking = await Bookconsaltion.findById(id);
    if (!currentBooking) {
      return sendResponse(res, false, null, "Booking not found");
    }
    const clash = await Bookconsaltion.findOne({
      _id: { $ne: id },
      slot_date,
      slot_time,
      type: currentBooking.type,
      slot_status: "confirmed",
    });
    if (clash) {
      return sendResponse(
        res,
        false,
        null,
        "This slot was just booked by someone else. Please pick another time.",
      );
    }
    const booking = await Bookconsaltion.findByIdAndUpdate(
      id,
      {
        slot_date,
        slot_time,
        slot_duration,
        slot_status: "confirmed",
      },
      { returnDocument: "after" },
    );

    sendSlotConfirmedUser(booking);
    sendSlotConfirmedAdmin(booking);

    return sendResponse(res, true, booking, "Slot saved successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const deleteBooking = async (req, res) => {
  try {
    const deleted = await Bookconsaltion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendResponse(res, false, null, "Booking not found");
    }
    return sendResponse(res, true, null, "Booking deleted");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteBookings = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(
        res,
        false,
        null,
        "ids array is required and cannot be empty",
      );
    }
    const result = await Bookconsaltion.deleteMany({ _id: { $in: ids } });
    return sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      `${result.deletedCount} booking(s) deleted successfully`,
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getGiftEligibility = async (req, res) => {
  try {
    const { user_id, phone } = req.query;
    if (!user_id && !phone) {
      return sendResponse(res, false, null, "user_id or phone required");
    }
    const query = {
      slot_status: "confirmed",
      is_redeemed: false,
      product_id: { $ne: null },
    };
    if (user_id) query.user_id = user_id;
    else query.phone = phone;

    const booking = await Bookconsaltion.findOne(query)
      .sort({ createdAt: 1 })
      .populate("product_id", "name images price");
    if (!booking) {
      return sendResponse(res, true, null, "No eligible gift found");
    }
    return sendResponse(
      res,
      true,
      {
        booking_id: booking._id,
        product: booking.product_id,
        product_title: booking.product_title,
      },
      "Eligible gift found",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const getMyBookings = async (req, res) => {
  try {
    const user_id = req.user?._id || req.query.user_id;
    const phone = req.query.phone;

    if (!user_id && !phone) {
      return sendResponse(res, false, null, "user_id or phone is required");
    }

    const query = user_id ? { user_id } : { phone };

    const bookings = await Bookconsaltion.find(query)
      .populate("product_id", "name images price")
      .sort({ createdAt: -1 });

    return sendResponse(res, true, bookings, "My bookings fetched");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      message,
      type,
      transaction_id,
      amount,
      payment_method,
      product_title,
      slot_date,
      slot_time,
      slot_duration,
      slot_status,
    } = req.body;

    const booking = await Bookconsaltion.findById(id);
    if (!booking) {
      return sendResponse(res, false, null, "Booking not found");
    }

    const wasConfirmed = booking.slot_status === "confirmed";

    if (name !== undefined) booking.name = name;
    if (email !== undefined) booking.email = email;
    if (phone !== undefined) booking.phone = phone;
    if (message !== undefined) booking.message = message;
    if (type !== undefined) booking.type = type;
    if (transaction_id !== undefined) booking.transaction_id = transaction_id;
    if (amount !== undefined) booking.amount = amount;
    if (payment_method !== undefined) booking.payment_method = payment_method;
    if (product_title !== undefined) booking.product_title = product_title;
    if (slot_date !== undefined) booking.slot_date = slot_date;
    if (slot_time !== undefined) booking.slot_time = slot_time;
    if (slot_duration !== undefined) booking.slot_duration = slot_duration;
    if (slot_status !== undefined) booking.slot_status = slot_status;

    await booking.save();

    const populated = await Bookconsaltion.findById(id).populate(
      "product_id",
      "name images price",
    );

    if (!wasConfirmed && populated.slot_status === "confirmed") {
      sendSlotConfirmedUser(populated);
      sendSlotConfirmedAdmin(populated);
    } else {
      sendBookingUpdatedUser(populated);
      sendBookingUpdatedAdmin(populated);
    }

    return sendResponse(res, true, populated, "Booking updated successfully");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  getBookedSlots,
  updateBookingSlot,
  updateBooking,
  deleteBooking,
  getMyBookings,
  bulkDeleteBookings,
  getGiftEligibility,
};

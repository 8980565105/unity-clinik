// controllers/bookconsaltansController.js
const Bookconsaltion = require("../models/Bookconsaltans");
const { sendResponse } = require("../utils/response");

const createBooking = async (req, res) => {
  try {
    const { phone, type, transaction_id, amount, product_id, product_title } =
      req.body;
    if (!phone || !type) {
      return sendResponse(res, 400, false, "Phone and type are required");
    }
    const booking = await Bookconsaltion.create({
      phone,
      type,
      transaction_id,
      amount,
      product_id: product_id || null,
      product_title: product_title || null,
    });
    return sendResponse(
      res,
      201,
      true,
      "Booking created successfully",
      booking,
    );
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
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

// const getBooking = async (req, res) => {
//   try {
//     const booking = await Bookconsaltion.findById(req.params.id);

//     if (!booking) return sendResponse(res, false, null, "Booking not found");
//     return sendResponse(res, true, booking, "Booking fetched");
//   } catch (err) {
//     return sendResponse(res, false, null, err.message);
//   }
// };

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

// const deleteBooking = async (req, res) => {
//   try {
//     await Bookconsaltion.findByIdAndDelete(req.params.id);
//     return sendResponse(res, true, null, "Booking deleted");
//   } catch (err) {
//     return sendResponse(res, false, null, err.message);
//   }
// };
const deleteBooking = async (req, res) => {
  try {
    await Bookconsaltion.findByIdAndDelete(req.params.id);
    return sendResponse(res, true, null, "Booking deleted");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

module.exports = { createBooking, getBookings, getBooking, deleteBooking };

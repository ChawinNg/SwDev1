const User = require("../models/User");
const Provider = require("../models/Provider");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Private
exports.getBookings = async (req, res, next) => {
  let query;
  let providerId = req.params.providerId;
  if (req.user.role !== "admin") {
    if (providerId) {
      query = Booking.find({
        user: req.user.id,
        provider: providerId,
      }).populate({
        path: "provider",
        select: "bookingDate provider",
      });
    } else {
      query = Booking.find({
        user: req.user.id,
      }).populate({
        path: "provider",
        select: "bookingDate provider",
      });
    }
  } else {
    if (providerId) {
      query = Booking.find({ provider: providerId }).populate({
        path: "provider",
        select: "bookingDate provider",
      });
    } else {
      query = Booking.find().populate({
        path: "provider",
        select: "bookingDate provider",
      });
    }
  }
  try {
    const bookings = await query;
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

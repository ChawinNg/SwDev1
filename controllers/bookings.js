const User = require("../models/User");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
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

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "provider",
      select: "bookingDate provider",
    });
    console.log(booking, "test get book");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }
    if (req.user.role === "user" && req.user.id !== booking.user.toString()) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to get this Booking`,
      });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find booking" });
  }
};

//@desc     Add booking
//@route    POST /api/v1/providers/:providerId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    console.log(req.body, "test 2", req.params);
    req.body.provider = req.params.providerId;
    const provider = await Provider.findById(req.params.providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: `No provider with the id of ${req.params.providerId}`,
      });
    }

    req.body.user = req.user.id;

    const existedBookings = await Booking.find({ user: req.user.id });

    if (existedBookings.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 bookings`,
      });
    }

    const booking = await Booking.create(req.body);
    console.log(booking, "test");
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot create Booking",
    });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No Booking with the id of ${req.params.id}`,
      });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this Booking`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot update Booking",
    });
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No Booking with the id of ${req.params.id}`,
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete booking",
    });
  }
};

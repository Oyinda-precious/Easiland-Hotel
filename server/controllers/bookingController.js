import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//function to check availability of rooms and make a booking
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });
    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.error(error.message);
  }
};

//API to check availability of room
//Post/api/booking/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//API to make a booking
//Post/api/booking
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests } = req.body;
    // console.log("Room ID received in backend:", roomId);
    const user = req.user._id;
    //before booking cheeck availability of the room
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room: roomId,
    });
    if (!isAvailable) {
      return res.json({ success: false, message: "Room is not available" });
    }
    //Get total price from room
    const roomData = await Room.findById(roomId).populate("hotel");
    if (!roomData) {
      return res.json({
        success: false,
        message: "Room not found",
      });
    }
    let totalPrice = roomData.pricePerNight;
    // const roomData = await Room.findById(roomId).populate("hotel");
    // const roomData = await Room.findById(room).populate("hotel");
    // let totalPrice = roomData.pricePerNight;

    //calculate total price based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;
    const booking = await Booking.create({
      user,
      room: roomId,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    res.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Api to get all bookings of a user
//Get/api/bookings/user

export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};

//Api to get all bookings of a hotel owner
//Get/api/bookings/owner
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No hotel found " });
    }
    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    //Total Bookings
    const totalBookings = bookings.length;

    //Total revenue
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch hotel bookings",
      error: error.message,
    });
  }
};

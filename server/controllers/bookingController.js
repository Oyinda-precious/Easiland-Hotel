import resend from "../configs/resend.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import axios from "axios";

// ─────────────────────────────────────────────
// Helper: check room availability
// ─────────────────────────────────────────────
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });
    return bookings.length === 0;
  } catch (error) {
    console.error(error.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/bookings/check-availability (public)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// POST /api/bookings/book (guest users)
// ─────────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests } = req.body;

    // Guest user (custom JWT)
    const userId = req.guestUser._id;
    const userEmail = req.guestUser.email;
    const userName = req.guestUser.name;

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room: roomId,
    });
    if (!isAvailable)
      return res.json({ success: false, message: "Room is not available" });

    const roomData = await Room.findById(roomId).populate("hotel");
    if (!roomData || !roomData.hotel)
      return res.json({ success: false, message: "Room or hotel not found" });

    // Calculate total price
    let totalPrice = roomData.pricePerNight;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24),
    );
    totalPrice *= nights;

    const booking = await Booking.create({
      user: userId,
      room: roomId,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    // Send confirmation email
    try {
      await resend.emails.send({
        from: process.env.SENDER_EMAIL,
        to: userEmail,
        subject: "Booking Confirmation",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #1d4ed8;">Your Booking Confirmation</h2>
            <p>Dear ${userName},</p>
            <p>Thank you for booking with us! Here are your booking details:</p>
            <ul>
              <li><strong>Booking ID:</strong> ${booking._id}</li>
              <li><strong>Hotel:</strong> ${roomData.hotel.name}</li>
              <li><strong>Location:</strong> ${roomData.hotel.address}</li>
              <li><strong>Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
              <li><strong>Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
              <li><strong>Guests:</strong> ${booking.guests}</li>
              <li><strong>Total Amount:</strong>  ₦${booking.totalPrice}</li>
            </ul>
            <p>We look forward to hosting you!</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log("Email error:", emailError.message);
    }

    res.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/bookings/user (guest users)
// ─────────────────────────────────────────────
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.guestUser._id;
    console.log("Fetching bookings for guest user:", userId);

    const bookings = await Booking.find({ user: userId })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    console.log("Bookings found:", bookings.length);
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/bookings/hotel (Clerk owner - dashboard)
// ─────────────────────────────────────────────
export const getHotelBookings = async (req, res) => {
  try {
    const ownerId = req.user._id; // Clerk owner
    const hotel = await Hotel.findOne({ owner: ownerId });

    if (!hotel) return res.json({ success: false, message: "No hotel found" });

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, bookings },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/bookings/paystack-payment (guest users)
// ─────────────────────────────────────────────
export const paystackPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    const totalPrice = booking.totalPrice;
    const { origin } = req.headers;
    const userEmail = req.guestUser.email;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: userEmail,
        amount: totalPrice * 100, // Paystack uses kobo
        metadata: { bookingId },
        callback_url: `${origin}/payment-success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ success: true, url: response.data.data.authorization_url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Payment initialization failed" });
  }
};

import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import GuestUser from "../models/GuestUser.js";
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

    // ── Email 1: Detailed confirmation to GUEST ──
    try {
      await transporter.sendMail({
        from: `"Easiland Hotel" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Booking Confirmation - Easiland Hotel",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1d4ed8;">Your Booking Confirmation</h2>
            <p>Dear ${userName},</p>
            <p>Thank you for booking with us! Here are your booking details:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 6px 0;"><strong>Booking ID:</strong> ${booking._id}</li>
                <li style="padding: 6px 0;"><strong>Hotel:</strong> ${roomData.hotel.name}</li>
                <li style="padding: 6px 0;"><strong>Location:</strong> ${roomData.hotel.address}</li>
                <li style="padding: 6px 0;"><strong>Room Type:</strong> ${roomData.roomType}</li>
                <li style="padding: 6px 0;"><strong>Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
                <li style="padding: 6px 0;"><strong>Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
                <li style="padding: 6px 0;"><strong>Nights:</strong> ${nights}</li>
                <li style="padding: 6px 0;"><strong>Guests:</strong> ${booking.guests}</li>
                <li style="padding: 6px 0;"><strong>Total Amount:</strong> ₦${booking.totalPrice.toLocaleString()}</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Please proceed to payment to confirm your reservation.
              You can view and manage your bookings by logging into your account.
            </p>
            <p>We look forward to hosting you!</p>
            <p style="color: #6b7280; font-size: 12px;">— Easiland Hotel Team</p>
          </div>
        `,
      });
      console.log("Guest confirmation email sent to:", userEmail);
    } catch (emailError) {
      console.log("Guest email error:", emailError.message);
    }

    // ── Email 2: Quick notification to GUEST ──
    // try {
    //   await transporter.sendMail({
    //     from: `"Easiland Hotel" <${process.env.EMAIL_USER}>`,
    //     to: userEmail,
    //     subject: "Booking Received - Check Your Email",
    //     html: `
    //       <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
    //         <h2 style="color: #1d4ed8;">Booking Received! ✅</h2>
    //         <p>Dear ${userName},</p>
    //         <p>Your booking has been received successfully.</p>
    //         <p style="background: #eff6ff; border-radius: 8px; padding: 16px; border-left: 4px solid #1d4ed8;">
    //           📧 A detailed confirmation email has been sent to
    //           <strong>${userEmail}</strong>.
    //           Kindly check your inbox (and spam folder) for your full booking details.
    //         </p>
    //         <p style="color: #6b7280; font-size: 14px;">
    //           You can also view your booking anytime by logging into your account
    //           and clicking <strong>My Bookings</strong>.
    //         </p>
    //         <p style="color: #6b7280; font-size: 12px;">— Easiland Hotel Team</p>
    //       </div>
    //     `,
    //   });
    //   console.log("Notification email sent to:", userEmail);
    // } catch (notifError) {
    //   console.log("Notification email error:", notifError.message);
    // }

    // ── Email 3: Notification to OWNER ──
    try {
      const hotelOwner = await User.findById(roomData.hotel.owner);
      const ownerEmail = hotelOwner?.email;

      if (ownerEmail) {
        await transporter.sendMail({
          from: `"Easiland Hotel System" <${process.env.EMAIL_USER}>`,
          to: ownerEmail,
          subject: "New Booking Received - Easiland Hotel",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #16a34a;">New Booking Received! 🎉</h2>
              <p>Hello,</p>
              <p>You have received a new booking. Here are the details:</p>
              <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #16a34a;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="padding: 6px 0;"><strong>Booking ID:</strong> ${booking._id}</li>
                  <li style="padding: 6px 0;"><strong>Guest Name:</strong> ${userName}</li>
                  <li style="padding: 6px 0;"><strong>Guest Email:</strong> ${userEmail}</li>
                  <li style="padding: 6px 0;"><strong>Room Type:</strong> ${roomData.roomType}</li>
                  <li style="padding: 6px 0;"><strong>Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
                  <li style="padding: 6px 0;"><strong>Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
                  <li style="padding: 6px 0;"><strong>Nights:</strong> ${nights}</li>
                  <li style="padding: 6px 0;"><strong>Guests:</strong> ${booking.guests}</li>
                  <li style="padding: 6px 0;"><strong>Total Amount:</strong> ₦${booking.totalPrice.toLocaleString()}</li>
                  <li style="padding: 6px 0;"><strong>Payment Status:</strong> Pending</li>
                </ul>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Login to your dashboard to view and manage this booking.
              </p>
              <p style="color: #6b7280; font-size: 12px;">— Easiland Hotel System</p>
            </div>
          `,
        });
        console.log("Owner notification email sent to:", ownerEmail);
      }
    } catch (ownerEmailError) {
      console.log("Owner email error:", ownerEmailError.message);
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
    const ownerId = req.user._id;
    const hotel = await Hotel.findOne({ owner: ownerId });

    if (!hotel) return res.json({ success: false, message: "No hotel found" });

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    // Manually fetch user from either GuestUser or Clerk User
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        const userId = booking.user?.toString();
        let user = null;

        // Clerk IDs start with "user_"
        if (userId && userId.startsWith("user_")) {
          user = await User.findById(userId).select("username email image");
        } else {
          // GuestUser MongoDB ObjectId
          try {
            user = await GuestUser.findById(userId).select("name email image");
          } catch (e) {
            user = null;
          }
        }

        bookingObj.user = user || null;
        return bookingObj;
      }),
    );

    const totalBookings = populatedBookings.length;
    const totalRevenue = populatedBookings.reduce(
      (acc, b) => acc + b.totalPrice,
      0,
    );

    res.json({
      success: true,
      dashboardData: {
        totalBookings,
        totalRevenue,
        bookings: populatedBookings,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/bookings/cancel/:bookingId (guest users)
// ─────────────────────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.guestUser._id;

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.json({ success: false, message: "Booking not found" });

    if (booking.user.toString() !== userId.toString())
      return res.json({
        success: false,
        message: "Not authorized to cancel this booking",
      });

    if (booking.isPaid)
      return res.json({
        success: false,
        message:
          "Paid bookings cannot be cancelled. Please contact us directly.",
      });

    await Booking.findByIdAndDelete(bookingId);

    res.json({ success: true, message: "Booking cancelled successfully" });
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
        amount: totalPrice * 100,
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

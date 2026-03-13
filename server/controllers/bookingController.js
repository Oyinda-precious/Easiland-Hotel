// import transporter from "../configs/nodemailer.js";
import resend from "../configs/resend.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
// import PaystackService from "../services/paystackPayment.js";
import axios from "axios";

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
    console.log("Room Data:", roomData);
    console.log("Hotel inside room:", roomData?.hotel);
    if (!roomData || !roomData.hotel) {
      return res.json({
        success: false,
        message: "Room or hotel not found",
      });
    }
    let totalPrice = roomData.pricePerNight;
    // const roomData = await Room.findById(roomId).populate("hotel");
    // if (!roomData) {
    //   return res.json({
    //     success: false,
    //     message: "Room not found",
    //   });
    // }

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
      hotel: roomData.hotel?._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    try {
      await resend.emails.send({
        from: process.env.SENDER_EMAIL,
        to: req.user.email,
        subject: "Booking Confirmation",
        html: `
      <h2>Your Booking Confirmation</h2>
      <p>Dear ${req.user.username},</p>
      <p>Thank you for booking with us! Here are your booking details:</p>
      <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
        <li><strong>Location:</strong> ${roomData.hotel.address}</li>
        <li><strong>Date:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
        <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || "$"} ${booking.totalPrice} /night</li>
      </ul>
      <p>We look forward to hosting you! If you have any questions, feel free to contact us.</p>
      <p>Best regards,</p>
    `,
      });
      console.log("Booking email sent");
    } catch (error) {
      console.log("Email error:", error);
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

//Api to get all bookings of a user
//Get/api/bookings/user

export const getUserBookings = async (req, res) => {
  try {
    console.log("Logged in user id:", req.user._id);

    const bookings = await Booking.find({ user: req.user._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    console.log("Bookings returned:", bookings);

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};

// export const getUserBookings = async (req, res) => {
//   try {
//     const user = req.user._id;
//     const bookings = await Booking.find({ user })
//       .populate("room hotel")
//       .sort({ createdAt: -1 });
//     res.json({ success: true, bookings });
//   } catch (error) {
//     res.json({
//       success: false,
//       message: "Failed to fetch user bookings",
//       error: error.message,
//     });
//   }
// };

//Api to get all bookings of a hotel owner
//Get/api/bookings/owner
export const getHotelBookings = async (req, res) => {
  try {
    const ownerId = req.user._id; // ← FIXED: was req.auth.userId
    console.log("Looking for hotel with owner:", ownerId);
    const hotel = await Hotel.findOne({ owner: ownerId });
    console.log("Hotel found:", hotel);
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

//payment confirmation
export const paystackPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    const roomData = await Room.findById(booking.room).populate("hotel");
    const totalPrice = booking.totalPrice;
    const { origin } = req.headers;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount: totalPrice * 100, // Paystack uses kobo
        metadata: {
          bookingId,
        },
        callback_url: `${origin}/payment-success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({
      success: true,
      url: response.data.data.authorization_url,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Payment initialization failed" });
  }
};

// const paystackInstance = new PaystackService(
//   process.env.PAYSTACK_SECRET_KEY,
// );

// const line_items = [
//   {
//     price_data: {
//       currency: "naira",
//       product_data: {
//         name: roomData.hotel.name,
//       },
//       unit_amount: totalPrice * 100,
//     },
//     quantity: 1,
//   },
// ];

//create Checkout session
// const session = await paystackInstance.checkOut.sessions.create({
//   line_items,
//   mode: "payment",
//   success_url: `${origin}/loader/my-bookings`,
//   cancel_url: `${origin}/my-bookings`,
//   metadata: {
//     bookingId,
//   },
// });
// res.json({ success: true, url: session.url });
//   } catch (error) {
//     res.json({ success: false, message: "Payment failed" });
//   }
// };

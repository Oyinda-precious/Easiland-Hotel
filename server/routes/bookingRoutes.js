import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  cancelBooking,
  paystackPayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectGuest } from "../middleware/guestAuthMiddleware.js";
import { verifyPaystackPayment } from "../controllers/paystackController.js";

const bookingRouter = express.Router();

// Public
bookingRouter.post("/check-availability", checkAvailabilityAPI);

// Guest routes
bookingRouter.post("/book", protectGuest, createBooking);
bookingRouter.get("/user", protectGuest, getUserBookings);
bookingRouter.delete("/cancel/:bookingId", protectGuest, cancelBooking);
bookingRouter.post("/paystack-payment", protectGuest, paystackPayment);

// Owner routes
bookingRouter.get("/hotel", protect, getHotelBookings);

// Payment verification
bookingRouter.get("/verify-payment", verifyPaystackPayment);

export default bookingRouter;

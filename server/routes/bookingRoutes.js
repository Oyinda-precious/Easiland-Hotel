import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  paystackPayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyPaystackPayment } from "../controllers/paystackController.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);

bookingRouter.get("/verify-payment", verifyPaystackPayment);
bookingRouter.post("/paystack-payment", protect, paystackPayment);

export default bookingRouter;

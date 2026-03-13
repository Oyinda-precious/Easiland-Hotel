import express from "express";
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  paystackPayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectGuest } from "../middleware/guestAuthMiddleware.js";
import { verifyPaystackPayment } from "../controllers/paystackController.js";

const bookingRouter = express.Router();

// Public - no auth needed
bookingRouter.post("/check-availability", checkAvailabilityAPI);

// Guest routes - custom JWT auth
bookingRouter.post("/book", protectGuest, createBooking);
bookingRouter.get("/user", protectGuest, getUserBookings);
bookingRouter.post("/paystack-payment", protectGuest, paystackPayment);

// Owner routes - Clerk auth
bookingRouter.get("/hotel", protect, getHotelBookings);

// Payment verification
bookingRouter.get("/verify-payment", verifyPaystackPayment);

export default bookingRouter;

// import express from "express";
// import {
//   checkAvailabilityAPI,
//   createBooking,
//   getHotelBookings,
//   getUserBookings,
//   paystackPayment,
// } from "../controllers/bookingController.js";
// import { protect } from "../middleware/authMiddleware.js";
// import { verifyPaystackPayment } from "../controllers/paystackController.js";

// const bookingRouter = express.Router();

// bookingRouter.post("/check-availability", checkAvailabilityAPI);
// bookingRouter.post("/book", protect, createBooking);
// bookingRouter.get("/user", protect, getUserBookings);
// bookingRouter.get("/hotel", protect, getHotelBookings);

// bookingRouter.get("/verify-payment", verifyPaystackPayment);
// bookingRouter.post("/paystack-payment", protect, paystackPayment);

// export default bookingRouter;

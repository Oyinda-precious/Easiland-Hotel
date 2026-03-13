import express from "express";
import {
  registerGuest,
  loginGuest,
  googleLogin,
  getGuestMe,
  verifyOTP,
  resendOTP,
} from "../controllers/guestAuthController.js";
import { protectGuest } from "../middleware/guestAuthMiddleware.js";

const guestAuthRouter = express.Router();

guestAuthRouter.post("/register", registerGuest);
guestAuthRouter.post("/verify-otp", verifyOTP);
guestAuthRouter.post("/resend-otp", resendOTP);
guestAuthRouter.post("/login", loginGuest);
guestAuthRouter.post("/google", googleLogin);
guestAuthRouter.get("/me", protectGuest, getGuestMe);

export default guestAuthRouter;

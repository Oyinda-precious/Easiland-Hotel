import express from "express";
import {
  register,
  login,
  googleLogin,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/google", googleLogin);
authRouter.get("/me", protect, getMe);

export default authRouter;

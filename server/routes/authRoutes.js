import express from "express";
import { register, login, googleLogin } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/google", googleLogin);

export default authRouter;

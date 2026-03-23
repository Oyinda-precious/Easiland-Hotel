import GuestUser from "../models/GuestUser.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
// import resend from "../configs/resend.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.GUEST_JWT_SECRET, { expiresIn: "7d" });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerGuest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "All fields are required" });

    if (password.length < 6)
      return res.json({
        success: false,
        message: "Password must be at least 6 characters",
      });

    const existingUser = await GuestUser.findOne({ email });

    if (existingUser && existingUser.isVerified)
      return res.json({
        success: false,
        message: "Email already registered. Please login.",
      });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      await GuestUser.create({ name, email, password, otp, otpExpiry });
    }

    await sendOTPEmail(email, name, otp);

    res.json({
      success: true,
      message:
        "OTP sent to your email. Please verify to complete registration.",
      email,
    });
  } catch (error) {
    console.log("Register error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.json({
        success: false,
        message: "Email and OTP are required",
      });

    const user = await GuestUser.findOne({ email });

    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res.json({
        success: false,
        message: "Email already verified. Please login.",
      });

    if (!user.otp || user.otp !== otp)
      return res.json({ success: false, message: "Invalid OTP code" });

    if (user.otpExpiry < new Date())
      return res.json({
        success: false,
        message: "OTP has expired. Please register again.",
      });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.log("OTP verify error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await GuestUser.findOne({ email });

    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isVerified)
      return res.json({ success: false, message: "Email already verified" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginGuest = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: "All fields are required" });

    const user = await GuestUser.findOne({ email });

    if (!user)
      return res.json({ success: false, message: "Invalid email or password" });

    if (!user.isVerified)
      return res.json({
        success: false,
        message: "Please verify your email first",
        needsVerification: true,
        email,
      });

    if (!user.password)
      return res.json({
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await GuestUser.findOne({ email });

    if (!user) {
      // New user via Google - auto verified
      user = await GuestUser.create({
        name,
        email,
        googleId,
        image: picture,
        isVerified: true,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.image = picture;
        user.isVerified = true;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.log("Google login error:", error.message);
    res.json({ success: false, message: "Google login failed" });
  }
};

export const getGuestMe = async (req, res) => {
  try {
    const user = req.guestUser;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

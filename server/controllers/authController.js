import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─── REGISTER ───────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      image: "",
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Registration failed" });
  }
};

// ─── LOGIN ───────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Google-only users won't have a password
    if (!user.password) {
      return res.json({
        success: false,
        message: "Please log in with Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Login failed" });
  }
};

// ─── GOOGLE LOGIN ─────────────────────────────────────────
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        image: picture,
        googleId,
      });
    } else {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Google login failed" });
  }
};

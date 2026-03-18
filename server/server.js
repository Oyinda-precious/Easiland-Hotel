import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import guestAuthRouter from "./routes/guestAuthRoutes.js";

connectDB();
connectCloudinary();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow localhost and any vercel.app URL for your project
      const allowedOrigins = [
        "http://localhost:5173",
        "https://easiland-hotel-kzbz.vercel.app",
      ];

      // Allow any Vercel preview URL for your project
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.includes("oyindamolas-projects") ||
        origin.includes("easiland-hotel-kzbz")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(clerkMiddleware());

// Clerk webhooks
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is running"));

// Routes
app.use("/api/user", userRouter);
app.use("/api/guest", guestAuthRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

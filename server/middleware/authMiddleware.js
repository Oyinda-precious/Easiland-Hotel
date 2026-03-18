import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - invalid token" });
  }
};

// Keep this one we added earlier:

// JWT_SECRET=easiland2025secretjwtkey

// import { requireAuth, clerkClient } from "@clerk/express";
// import User from "../models/User.js";

// export const protect = [
//   requireAuth(),

//   async (req, res, next) => {
//     try {
//       const userId = req.auth().userId;

//       let user = await User.findById(userId);

//       if (!user) {
//         const clerkUser = await clerkClient.users.getUser(userId);

//         user = await User.create({
//           _id: clerkUser.id,
//           email: clerkUser.emailAddresses[0].emailAddress,
//           username:
//             `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
//           image: clerkUser.imageUrl,
//           role: "user",
//           searchedCities: [],
//         });
//       }

//       req.user = user;
//       next();
//     } catch (error) {
//       console.log("Auth error:", error.message);
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }
//   },
// ];

// // client ID 636416740153-toqggeklul0cakgqeop2qfnmeu9andl5.apps.googleusercontent.com
// //CLIENT SECRET-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

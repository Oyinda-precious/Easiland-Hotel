import User from "../models/User.js";
import { clerkClient } from "@clerk/express";
// import { getAuth } from "@clerk/express";

// Middleware to check if the user is authenticated

// export const protect = async (req, res, next) => {
//   const { userId } = req.auth;
//   if (!userId) {
//     res.json({ success: false, message: "not authenticated" });
//   } else {
//     const user = await User.findById(userId);
//     req.user = user;
//     next();
//   }
// };

// export const protect = async (req, res, next) => {
//   const { userId } = req.auth(); // ✅ USE FUNCTION

//   if (!userId) {
//     return res
//       .status(401)
//       .json({ success: false, message: "not authenticated" });
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     return res
//       .status(404)
//       .json({ success: false, message: "User not found in DB" });
//   }

//   req.user = user;
//   next();
// };

export const protect = async (req, res, next) => {
  const { userId } = req.auth();

  if (!userId) {
    return res.status(401).json({ message: "not authenticated" });
  }

  let user = await User.findById(userId);

  // If user does not exist → fetch from Clerk and create
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);

    user = await User.create({
      _id: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      username:
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      image: clerkUser.imageUrl,
      role: "user",
      recentSearchedCities: [],
    });
  }

  req.user = user;
  next();
};

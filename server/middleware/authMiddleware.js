import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = [
  requireAuth(),

  async (req, res, next) => {
    try {
      const userId = req.auth.userId;

      let user = await User.findById(userId);

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);

        user = await User.create({
          _id: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          username:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          image: clerkUser.imageUrl,
          role: "user",
          searchedCities: [],
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log("Auth error:", error.message);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  },
];

// import User from "../models/User.js";
// import { clerkClient, verifyToken } from "@clerk/express";

// // Middleware to check if the user is authenticated

// export const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Not authenticated" });
//     }

//     const token = authHeader.split(" ")[1];

//     const { sub: userId } = await verifyToken(token, {
//       jwtKey: process.env.CLERK_JWT_KEY,
//     });

//     // const { sub: userId } = await verifyToken(token, {
//     //   secretKey: process.env.CLERK_SECRET_KEY,
//     // });

//     let user = await User.findById(userId);

//     // If user doesn't exist in DB → create from Clerk
//     if (!user) {
//       const clerkUser = await clerkClient.users.getUser(userId);

//       user = await User.create({
//         _id: clerkUser.id,
//         email: clerkUser.emailAddresses[0].emailAddress,
//         username:
//           `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
//         image: clerkUser.imageUrl,
//         role: "user",
//         searchedCities: [],
//       });
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     console.log("Auth error:", error.message);

//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid or expired token" });
//   }
// };

// export const protect = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token || token === "null") {
//       return res.status(401).json({ message: "Not authenticated" });
//     }

//     const { sub: userId } = await verifyToken(token, {
//       secretKey: process.env.CLERK_SECRET_KEY,
//     });

//     let user = await User.findById(userId);

//     if (!user) {
//       const clerkUser = await clerkClient.users.getUser(userId);
//       user = await User.create({
//         _id: clerkUser.id,
//         email: clerkUser.emailAddresses[0].emailAddress,
//         username:
//           `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
//         image: clerkUser.imageUrl,
//         role: "user",
//         recentSearchedCities: [],
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("Auth error:", error.message);
//     return res.status(401).json({ message: "Not authenticated" });
//   }
// };

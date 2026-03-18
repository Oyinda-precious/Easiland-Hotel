import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional — null if Google login
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: [{ type: String }],
    googleId: { type: String }, // for Google OAuth users
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;

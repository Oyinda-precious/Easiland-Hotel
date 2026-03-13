import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const guestUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    image: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    recentSearchedCities: [{ type: String }],
  },
  { timestamps: true },
);

// Hash password before saving
guestUserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
guestUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const GuestUser = mongoose.model("GuestUser", guestUserSchema);

export default GuestUser;

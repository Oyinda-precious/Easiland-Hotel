// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     mongoose.connection.on("connected", () =>
//       console.log("Database connected"),
//     );

//     await mongoose.connect(`${process.env.MONGODB_URI}/hotel2025`);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/hotel2025`);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;

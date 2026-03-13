import axios from "axios";
import Booking from "../models/Booking.js";

export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paymentData = response.data.data;

    if (paymentData.status === "success") {
      const bookingId = paymentData.metadata.bookingId;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.json({ success: false, message: "Booking not found" });
      }

      booking.isPaid = true;
      booking.paymentMethod = "Paystack";

      await booking.save();

      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    res.json({
      success: false,
      message: "Payment verification failed",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Verification error",
    });
  }
};

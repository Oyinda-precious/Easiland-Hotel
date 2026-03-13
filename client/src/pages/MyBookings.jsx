import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useGuestAuth } from "../context/GuestAuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const { axios } = useAppContext();
  const { guestUser, getGuestToken } = useGuestAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(null);

  const fetchUserBookings = async () => {
    try {
      const token = getGuestToken();
      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Bookings error:", error);
      toast.error("Error fetching bookings");
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setLoadingPayment(bookingId);
      const token = getGuestToken();
      const { data } = await axios.post(
        "/api/bookings/paystack-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setLoadingPayment(null);
    }
  };

  useEffect(() => {
    if (!guestUser) {
      navigate("/login");
      return;
    }
    fetchUserBookings();
  }, [guestUser]);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="View your upcoming and past reservations. Plan your trips seamlessly with just a few clicks"
        align="left"
      />

      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.length === 0 && (
          <p className="text-gray-500 mt-10 text-center">No bookings yet.</p>
        )}

        {bookings.map((booking) => {
          if (!booking.room) return null;
          return (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
            >
              {/* Hotel details */}
              <div className="flex flex-col md:flex-row">
                <img
                  src={booking.room?.images?.[0]}
                  alt="hotel"
                  className="md:w-44 h-32 rounded shadow object-cover"
                />
                <div className="flex flex-col gap-1.5 max-md:mt-3 md:ml-4">
                  <p className="font-playfair text-2xl">
                    {booking.hotel?.name}{" "}
                    <span className="font-inter text-sm">
                      ({booking.room?.roomType})
                    </span>
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src={assets.locationIcon} alt="" />
                    <span>{booking.hotel?.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img src={assets.guestsIcon} alt="" />
                    <span>Guests: {booking.guests}</span>
                  </div>
                  <p className="font-medium">Total: ${booking.totalPrice}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex flex-row md:items-center md:gap-12 mt-3 gap-8">
                <div>
                  <p>Check-in:</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.checkInDate).toDateString()}
                  </p>
                </div>
                <div>
                  <p>Check-Out:</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.checkOutDate).toDateString()}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex flex-col items-start justify-center pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <p className={`text-sm ${booking.isPaid ? "text-green-500" : "text-red-500"}`}>
                    {booking.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>
                {!booking.isPaid && (
                  <button
                    disabled={loadingPayment === booking._id}
                    onClick={() => handlePayment(booking._id)}
                    className="px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {loadingPayment === booking._id ? "Processing..." : "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
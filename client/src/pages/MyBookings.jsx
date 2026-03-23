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
  const [cancelLoading, setCancelLoading] = useState(null);

  
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

  
  const handleCancel = async (bookingId) => {
   
    if (!window.confirm("Are you sure you want to cancel this booking? This cannot be undone.")) return;

    try {
      setCancelLoading(bookingId);
      const token = getGuestToken();
      const { data } = await axios.delete(
        `/api/bookings/cancel/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Booking cancelled successfully");
        
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelLoading(null);
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
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No bookings yet.</p>
            <button
              onClick={() => navigate("/rooms")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition"
            >
              Browse Rooms
            </button>
          </div>
        )}

       
        {bookings.map((booking) => {
          if (!booking.room) return null;
          return (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
            >
              
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
                  <p className="font-medium">
                    Total: ₦{booking.totalPrice?.toLocaleString()}
                  </p>
                </div>
              </div>

             
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

              
              <div className="flex flex-col items-start justify-center pt-3">

               
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`} />
                  <p className={`text-sm ${booking.isPaid ? "text-green-500" : "text-red-500"}`}>
                    {booking.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>

               
                {!booking.isPaid && (
                  <div className="flex gap-2 mt-4 flex-wrap">

                   
                    <button
                      disabled={loadingPayment === booking._id}
                      onClick={() => handlePayment(booking._id)}
                      className="px-4 py-1.5 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loadingPayment === booking._id ? "Processing..." : "Pay Now"}
                    </button>

                    
                    <button
                      disabled={cancelLoading === booking._id}
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-1.5 text-xs border border-red-400 text-red-500 rounded-full hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {cancelLoading === booking._id ? "Cancelling..." : "Cancel"}
                    </button>

                  </div>
                )}

               
                {booking.isPaid && (
                  <p className="text-xs text-gray-400 mt-2">
                    Contact us to modify this booking
                  </p>
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
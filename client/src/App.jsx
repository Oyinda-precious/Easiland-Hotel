import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import OwnerLogin from "./pages/hotelOwner/OwnerLogin";
import GuestLogin from "./pages/GuestLogin";
import GuestRegister from "./pages/GuestRegister";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import Loader from "./components/Loader";
import PaymentSuccess from "./pages/PaymentSuccess";
import { GuestAuthProvider } from "./context/GuestAuthContext";

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const { showHotelReg } = useAppContext();

  return (
    <GuestAuthProvider>
      <div>
        <Toaster />
        {/* Only show public Navbar on non-owner pages */}
        {!isOwnerPath && <Navbar />}

        <div className="min-h-[70vh]">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<AllRooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/loader/:nextUrl" element={<Loader />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* Guest Auth Routes */}
            <Route path="/login" element={<GuestLogin />} />
            <Route path="/register" element={<GuestRegister />} />

            {/* Owner Routes - Clerk protected */}
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="add-room" element={<AddRoom />} />
              <Route path="list-room" element={<ListRoom />} />
            </Route>
          </Routes>
        </div>

        <Footer />
      </div>
    </GuestAuthProvider>
  );
};

export default App;
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const GuestAuthContext = createContext();

export const GuestAuthProvider = ({ children }) => {
  const [guestUser, setGuestUser] = useState(null);
  const [guestLoading, setGuestLoading] = useState(true);

  // Load guest from localStorage
  useEffect(() => {
    const token = localStorage.getItem("guestToken");
    const user = localStorage.getItem("guestUser");
    if (token && user) {
      setGuestUser(JSON.parse(user));
    }
    setGuestLoading(false);
  }, []);

  // Email + password login
  const loginGuest = async (email, password) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/guest/login`,
        { email, password }
      );
      if (data.success) {
        localStorage.setItem("guestToken", data.token);
        localStorage.setItem("guestUser", JSON.stringify(data.user));
        setGuestUser(data.user);
        return { success: true };
      } else {
        
        return {
          success: false,
          message: data.message,
          needsVerification: data.needsVerification || false,
          email: data.email,
        };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  
  const registerGuest = async (name, email, password) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/guest/register`,
        { name, email, password }
      );
      return { success: data.success, message: data.message, email: data.email };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Google login (auto verified, logs in immediately)
  const googleLoginGuest = async (credential) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/guest/google`,
        { credential }
      );
      if (data.success) {
        localStorage.setItem("guestToken", data.token);
        localStorage.setItem("guestUser", JSON.stringify(data.user));
        setGuestUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout
  const logoutGuest = () => {
    localStorage.removeItem("guestToken");
    localStorage.removeItem("guestUser");
    setGuestUser(null);
    toast.success("Logged out successfully");
  };

  // Get token for API calls
  const getGuestToken = () => localStorage.getItem("guestToken");

  const value = {
    guestUser,
    guestLoading,
    loginGuest,
    registerGuest,
    googleLoginGuest,
    logoutGuest,
    getGuestToken,
  };

  return (
    <GuestAuthContext.Provider value={value}>
      {children}
    </GuestAuthContext.Provider>
  );
};

export const useGuestAuth = () => useContext(GuestAuthContext);
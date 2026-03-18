import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  

  const currency = import.meta.env.VITE_CURRENCY || "₦";
  const navigate = useNavigate();

  const { user, isLoaded: clerkLoaded } = useUser();  // isLoaded tells us when Clerk is ready
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setsearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Fetch all rooms (public)
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching rooms");
    }
  };

  // Fetch logged-in owner user data
  const fetchUser = async () => {
    try {
      const token = await getToken({ template: "default" });
      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setsearchedCities(data.recentSearchedCities || []);
      } else {
        setTimeout(() => fetchUser(), 5000);
      }
    } catch (error) {
      console.log("fetchUser error:", error.message);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    // Wait for Clerk to finish loading first
    if (!clerkLoaded) return;

    if (user) {
      fetchUser();
    } else {
      // Clerk loaded but no user logged in
      setUserLoading(false);
    }
  }, [user, clerkLoaded]);  // depend on both user AND clerkLoaded

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    userLoading,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setsearchedCities,
    rooms,
    setRooms,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);


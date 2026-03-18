import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₦";
  const navigate = useNavigate();

  const [isOwner, setIsOwner] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setsearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [ownerUser, setOwnerUser] = useState(
    JSON.parse(localStorage.getItem("ownerUser")) || null
  );

  // Get token from localStorage
  const getToken = () => localStorage.getItem("ownerToken");

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
      const token = getToken();
      if (!token) {
        setUserLoading(false);
        return;
      }
      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setsearchedCities(data.recentSearchedCities || []);
      }
    } catch (error) {
      console.log("fetchUser error:", error.message);
    } finally {
      setUserLoading(false);
    }
  };

  // Logout owner
  const logoutOwner = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    setOwnerUser(null);
    setIsOwner(false);
    navigate("/owner/login");
  };

  useEffect(() => {
    fetchUser();
  }, [ownerUser]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    currency,
    navigate,
    user: ownerUser,
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
    ownerUser,
    setOwnerUser,
    logoutOwner,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
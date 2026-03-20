import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;


// ✅ Auto-attach token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("ownerToken");
  // ✅ Only attach if no Authorization header already set
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("ownerToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

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

    // Verify token is valid by decoding it first
    const { data } = await axios.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      setOwnerUser(data.user);
      setIsOwner(data.user.role === "hotelOwner");
      setsearchedCities(data.user.recentSearchedCities || []);
    } else {
      // Token invalid — clear it
      localStorage.removeItem("ownerToken");
      localStorage.removeItem("ownerUser");
      setIsOwner(false);
      setOwnerUser(null);
    }
  } catch (error) {
    console.log("fetchUser error:", error.message);
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    setIsOwner(false);
    setOwnerUser(null);
  } finally {
    setUserLoading(false);
  }
};




  // const fetchUser = async () => {
  //   try {
  //     const token = getToken();
  //     if (!token) {
  //       setUserLoading(false);
  //       return;
  //     }
  //     const { data } = await axios.get("/api/user", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (data.success) {
  //       setIsOwner(data.role === "hotelOwner");
  //       setsearchedCities(data.recentSearchedCities || []);
  //     }
  //   } catch (error) {
  //     console.log("fetchUser error:", error.message);
  //   } finally {
  //     setUserLoading(false);
  //   }
  // };

  // Logout owner
  const logoutOwner = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerUser");
    setOwnerUser(null);
    setIsOwner(false);
    navigate("/owner/login");
  };

  // useEffect(() => {
  //   fetchUser();
  // }, [ownerUser]);


useEffect(() => {
  fetchUser();
}, []);

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
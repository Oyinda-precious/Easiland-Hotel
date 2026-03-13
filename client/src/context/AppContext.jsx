import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
// axios.defaults.baseURL = "http://localhost:3000";
// console.log("Backend URL being used:", axios.defaults.baseURL);
console.log("Backend URL being used:", import.meta.env.VITE_BACKEND_URL);

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();

  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setsearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Fetch rooms (public route)
  const fetchRooms = async () => {
    try {

      const { data } = await axios.get("/api/rooms");

      console.log("Rooms API response:", data);

      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error("Error fetching rooms");
    }
  };

  // Fetch logged-in user data
  const fetchUser = async () => {
    try {

      const token = await getToken({ template: "default" });

      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setsearchedCities(data.searchedCities);
      } else {

        // retry after 5 seconds if user not ready
        setTimeout(() => {
          fetchUser();
        }, 5000);

      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setUserLoading(false);
    }
  };

  // When user logs in
  useEffect(() => {
    if (user) {
      fetchUser();
    } else {
      setUserLoading(false);
    }
  }, [user]);

  // Load rooms on startup
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


// import axios from "axios";
// import { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useUser, useAuth } from "@clerk/clerk-react";
// import { toast } from "react-hot-toast";

// axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
// console.log("Backend URL being used:", import.meta.env.VITE_BACKEND_URL);

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {

//   const currency = import.meta.env.VITE_CURRENCY || "$";
//   const navigate = useNavigate();
//   const { user } = useUser();
//   const { getToken } = useAuth();

//   const [isOwner, setIsOwner] = useState(false);
//   const [userLoading, setUserLoading] = useState(true);
//   const [showHotelReg, setShowHotelReg] = useState(false);
//   const [searchedCities, setsearchedCities] = useState([]);
//   const [rooms, setRooms] = useState([]);

//   // Axios interceptor - attach token to every request
//   useEffect(() => {
//     const interceptor = axios.interceptors.request.use(async (config) => {
//       const token = await getToken({ template: "default" });
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     });
//     return () => axios.interceptors.request.eject(interceptor);
//   }, [getToken]);

//   const fetchRooms = async () => {
//     try {
//       const { data } = await axios.get('/api/rooms');
//       console.log("Rooms API response:", data);
//       if (data.success) {
//         setRooms(data.rooms);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error("Error fetching rooms");
//     }
//   };

//   const fetchUser = async () => {
//     try {
//       const token = await getToken({ template: "default" });
//       const { data } = await axios.get('/api/user', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (data.success) {
//         setIsOwner(data.role === "hotelOwner");
//         setsearchedCities(data.searchedCities);
//       } else {
//         setTimeout(() => { fetchUser(); }, 5000);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchUser();
//     } else {
//       setUserLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   const value = {
//     currency, navigate, user, getToken,
//     isOwner, setIsOwner,
//     userLoading,
//     axios,
//     showHotelReg, setShowHotelReg,
//     searchedCities, setsearchedCities,
//     rooms, setRooms,
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useAppContext = () => useContext(AppContext);
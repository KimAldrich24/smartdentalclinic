import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors`);
      
      if (data.success) {
        // ✅ Fixed: Handle null/undefined images
        const updatedDoctors = data.doctors.map((doc) => ({
          ...doc,
          image: doc.image && doc.image.startsWith("http")
            ? doc.image
            : doc.image
            ? `${backendUrl}/images/${doc.image}`
            : "/default-doctor.png", // ✅ Fallback if no image
        }));
        
        setDoctors(updatedDoctors);
      } else {
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const value = {
    doctors,
    loading,
    fetchDoctors,
    currencySymbol: "₱",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
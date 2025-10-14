import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Store token in localStorage whenever it changes
  useEffect(() => {
    if (aToken) {
      localStorage.setItem("aToken", aToken);
    } else {
      localStorage.removeItem("aToken");
    }
  }, [aToken]);

  // Fetch all doctors
  const getAllDoctors = async () => {
    if (!aToken) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setDoctors(data.doctors);
        console.log("Doctors fetched:", data.doctors);
      } else {
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setAToken("");
      }
    }
  };

  // Remove doctor
  const removeDoctor = async (id) => {
    if (!aToken) return;

    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/remove-doctor/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        toast.success("Doctor removed successfully");
        setDoctors((prev) => prev.filter((doc) => doc._id !== id));
      } else {
        toast.error(data.message || "Failed to remove doctor");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setAToken("");
      }
    }
  };

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        removeDoctor,
        backendUrl,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

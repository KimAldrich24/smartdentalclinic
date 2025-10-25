import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || null);
  const [userRole, setUserRole] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (!aToken) return;

    // Decode token to get role
    try {
      const payload = JSON.parse(atob(aToken.split(".")[1]));
      setUserRole(payload.role);
    } catch (err) {
      console.error("Invalid token", err);
      setAToken(null);
      setUserRole(null);
      localStorage.removeItem("aToken");
    }
  }, [aToken]);

  const getAllDoctors = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDoctors(res.data || []); // ensure array
    } catch (err) {
      console.error("Get doctors error:", err);
      setDoctors([]); // fallback
    }
  };
  

  return (
    <AdminContext.Provider value={{ aToken, setAToken, userRole, getAllDoctors, doctors, backendUrl }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

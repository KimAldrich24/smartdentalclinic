import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || null);
  const [userRole, setUserRole] = useState(null);
  const [doctors, setDoctors] = useState([]);

  // ✅ Save token to localStorage whenever it changes
  useEffect(() => {
    if (aToken) {
      localStorage.setItem("aToken", aToken);
    } else {
      localStorage.removeItem("aToken");
    }
  }, [aToken]);

  // ✅ Decode token to get role
  useEffect(() => {
    if (!aToken) {
      setUserRole(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(aToken.split(".")[1]));
      setUserRole(payload.role);
    } catch (err) {
      console.error("Invalid token", err);
      setAToken(null);
      setUserRole(null);
    }
  }, [aToken]);

  // ✅ Protected fetch for doctors
  const getAllDoctors = async () => {
    if (!aToken || userRole !== "admin") return;

    try {
      const res = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error("Get doctors error:", err);
      if (err.response?.status === 401) {
        setAToken(null);
        setUserRole(null);
      }
      setDoctors([]);
    }
  };

  // ✅ Trigger fetch only when token and role are valid
  useEffect(() => {
    if (aToken && userRole === "admin") {
      getAllDoctors();
    }
  }, [aToken, userRole]);

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken,
        userRole,
        getAllDoctors,
        doctors,
        backendUrl,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

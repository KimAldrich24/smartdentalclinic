import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || null);
  const [userRole, setUserRole] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [admin, setAdmin] = useState(null); // ✅ ADD THIS
  const [staff, setStaff] = useState([]);

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

// ✅ Fetch admin profile data
const getAdminProfile = async () => {
  console.log("🔍 getAdminProfile called", { aToken, userRole }); // ✅ DEBUG
  
  if (!aToken || userRole !== "admin") {
    console.log("❌ Blocked: No token or not admin"); // ✅ DEBUG
    return;
  }

  console.log("📡 Fetching admin profile from:", `${backendUrl}/api/admin/profile`); // ✅ DEBUG

  try {
    const res = await axios.get(`${backendUrl}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${aToken}` },
    });
    
    console.log("✅ Profile response:", res.data); // ✅ DEBUG
    
    if (res.data.success) {
      setAdmin(res.data.admin);
      console.log("✅ Admin state updated:", res.data.admin); // ✅ DEBUG
    } else {
      console.log("⚠️ Profile fetch failed:", res.data.message); // ✅ DEBUG
    }
  } catch (err) {
    console.error("❌ Get admin profile error:", err.response?.data || err.message);
    if (err.response?.status === 401) {
      setAToken(null);
      setUserRole(null);
    }
  }
};
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

  const getAllStaff = async () => {
  if (!aToken || userRole !== "admin") return;

  try {
    const res = await fetch(`${backendUrl}/api/admin/staff`, {
      headers: { Authorization: `Bearer ${aToken}` },
    });

    const data = await res.json();
    if (data.success) {
      setStaff(data.staff || []);
    }
  } catch (err) {
    console.error("Get staff error:", err);
  }
};

  // ✅ Trigger fetch when token and role are valid
  useEffect(() => {
    if (aToken && userRole === "admin") {
      getAdminProfile(); // ✅ ADD THIS
      getAllDoctors();
      getAllStaff(); // 🔥 ADD THIS
    }
  }, [aToken, userRole]);

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken,
        userRole,
        admin, // ✅ ADD THIS
        setAdmin, // ✅ ADD THIS
        getAdminProfile, // ✅ ADD THIS
        getAllDoctors,
        getAllStaff,
        doctors,
        staff,
        backendUrl,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
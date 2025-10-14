// src/context/DoctorContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [doctor, setDoctor] = useState(null);
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [loading, setLoading] = useState(true);

  // Axios instance with token
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    headers: { Authorization: dToken ? `Bearer ${dToken}` : "" },
  });

  // Auto-fetch doctor profile if logged in
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!dToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.get("/api/doctors/me");

        if (data.success && data.doctor) {
          setDoctor(data.doctor);
        } else {
          // Invalid token, logout
          logoutDoctor();
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error.response?.data || error);
        logoutDoctor();
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [dToken]);

  // Doctor login
  const loginDoctor = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctors/login`, { email, password });

      if (data.success && data.token) {
        localStorage.setItem("dToken", data.token);
        setDToken(data.token);
        setDoctor(data.doctor);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Doctor logout
  const logoutDoctor = () => {
    localStorage.removeItem("dToken");
    setDToken("");
    setDoctor(null);
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        dToken,
        loginDoctor,
        logoutDoctor,
        backendUrl,
        loading,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;

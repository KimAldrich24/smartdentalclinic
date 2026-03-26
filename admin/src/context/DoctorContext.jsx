// src/context/DoctorContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {

  const [doctor, setDoctor] = useState(null);
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [loading, setLoading] = useState(true);

  // Axios instance with token
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    headers: { Authorization: dToken ? `Bearer ${dToken}` : "" },
  });


// In DoctorContext.js — fetch doctor profile on token load
const fetchDoctorProfile = async (token) => {
  try {
    const res = await fetch(`${backendUrl}/api/doctors/me`, {
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
    const data = await res.json();
    if (data.success) setDoctor(data.doctor);
    else {
      setDToken(null);
      localStorage.removeItem('dToken');
    }
  } catch (err) {
    console.error('Failed to fetch doctor profile:', err);
  }
};

useEffect(() => {
  if (dToken) fetchDoctorProfile(dToken);
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

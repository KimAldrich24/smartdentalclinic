import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(
    JSON.parse(localStorage.getItem("adminData")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);

  // ✅ Keep token and admin in sync with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem("adminData", JSON.stringify(admin));
    } else {
      localStorage.removeItem("adminData");
    }
  }, [admin]);

  // ✅ Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
        { email, password }
      );

      setToken(res.data.token);
      setAdmin(res.data.admin);

      // Store in localStorage
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));

      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  };

  // ✅ Logout function
  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

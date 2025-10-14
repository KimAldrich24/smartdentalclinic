import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Load token + user from localStorage on init
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // ✅ Keep token in sync with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // ✅ Keep user in sync with localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // --- Auth functions ---
  const register = async (name, email, password) => {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
      { name, email, password }
    );
    return res.data;
  };

  const login = async (email, password) => {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
      { email, password }
    );

    setToken(res.data.token);
    setUser(res.data.user);

    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ Fetch current user if we only have a token
  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // ✅ Make sure to use res.data.user, not res.data
      setUser(res.data.user || res.data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      logout();
    }
  };
  
  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

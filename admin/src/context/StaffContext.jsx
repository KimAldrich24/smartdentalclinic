import { createContext, useState } from "react";

export const StaffContext = createContext();

export const StaffContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [sToken, setSToken] = useState(localStorage.getItem("sToken") || "");
  const [staff, setStaff] = useState(JSON.parse(localStorage.getItem("staff") || "null"));

  const loginStaff = async (email, password) => {
    try {
      const res = await fetch(`${backendUrl}/api/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        setSToken(data.token);
        setStaff(data.staff);
        localStorage.setItem("sToken", data.token);
        localStorage.setItem("staff", JSON.stringify(data.staff));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error("Staff login error:", err);
      return { success: false, message: "Login failed" };
    }
  };

  const logoutStaff = () => {
    setSToken("");
    setStaff(null);
    localStorage.removeItem("sToken");
    localStorage.removeItem("staff");
  };

  const value = {
    sToken,
    setSToken,
    staff,
    setStaff,
    backendUrl,
    loginStaff,
    logoutStaff,
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
};

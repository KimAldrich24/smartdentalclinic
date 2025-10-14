import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

const Login = () => {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setAToken, backendUrl, getAllDoctors } = useContext(AdminContext);
  const navigate = useNavigate(); // ✅ for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!name.trim() || !role) {
        return alert("Please fill in your name and select a role.");
      }
    }

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, role };

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          await getAllDoctors();
        }
        alert(`${mode === "login" ? "Login" : "Sign up"} successful!`);
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      alert("Something went wrong. Please try again.");
    }
  };

  // 🩵 Switch to Doctor Login Panel
  const handleSwitchToDoctor = () => {
    localStorage.removeItem("aToken"); // clear admin token
    setAToken("");
    navigate("/doctor-login"); // redirect
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[80vh] flex items-center justify-center bg-gray-100"
    >
      <div className="bg-white shadow-md rounded-2xl p-8 w-96 flex flex-col gap-6">
        {/* Form title */}
        <p className="text-2xl font-semibold text-center">
          <span className="text-blue-600">
            {mode === "login" ? "Admin Login" : "Admin Sign up"}
          </span>
        </p>

        {/* Name */}
        {mode === "signup" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 outline-none focus:border-blue-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Role */}
        {mode === "signup" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {mode === "login" ? "Log in" : "Sign up"}
        </button>

        {/* Toggle login/signup */}
        <p className="text-sm text-center">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>

        {/* 🩵 Switch to Doctor Login */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 mb-2">Are you a Doctor?</p>
          <button
            type="button"
            onClick={handleSwitchToDoctor}
            className="text-blue-600 underline font-medium"
          >
            Go to Doctor Login →
          </button>
        </div>
      </div>
    </form>
  );
};

export default Login;

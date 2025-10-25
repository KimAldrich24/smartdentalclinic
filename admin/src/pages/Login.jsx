import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { StaffContext } from "../context/StaffContext";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAToken, getAllDoctors, backendUrl } = useContext(AdminContext);
  const { loginDoctor } = useContext(DoctorContext);
  const { loginStaff } = useContext(StaffContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userType === "admin") {
        // Admin login
        const res = await fetch(`${backendUrl}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success && data.token) {
          setAToken(data.token);
          localStorage.setItem("aToken", data.token);
          localStorage.setItem("admin", JSON.stringify(data.user));
          await getAllDoctors();
          toast.success("Admin login successful!");
          navigate("/dashboard");
        } else {
          toast.error(data.message || "Login failed");
        }
      } else if (userType === "doctor") {
        // Doctor login
        const result = await loginDoctor(email, password);
        
        if (result.success) {
          toast.success("Doctor login successful!");
          navigate("/doctor-dashboard");
        } else {
          toast.error(result.message || "Login failed");
        }
      } else if (userType === "staff") {
        // Staff login
        const result = await loginStaff(email, password);
        
        if (result.success) {
          toast.success("Staff login successful!");
          navigate("/staff-dashboard");
        } else {
          toast.error(result.message || "Login failed");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Dental Clinic Login
        </h2>

        {/* User Type Toggle - NOW WITH 3 BUTTONS */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setUserType("admin")}
            className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${
              userType === "admin"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👨‍💼 Admin
          </button>
          <button
            type="button"
            onClick={() => setUserType("doctor")}
            className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${
              userType === "doctor"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👨‍⚕️ Doctor
          </button>
          <button
            type="button"
            onClick={() => setUserType("staff")}
            className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${
              userType === "staff"
                ? "bg-purple-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👔 Staff
          </button>
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder={`${userType}@example.com`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Password Input with Eye Icon */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit Button - NOW WITH 3 COLORS */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition shadow-md ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : userType === "admin"
              ? "bg-blue-600 hover:bg-blue-700"
              : userType === "doctor"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Logging in..." : `Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
        </button>

        {/* Patient Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you a patient?{" "}
            <a href="/patient-login" className="text-blue-500 hover:underline font-medium">
              Login here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
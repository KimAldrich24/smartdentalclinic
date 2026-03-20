import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { StaffContext } from "../context/StaffContext";
import { toast } from "react-toastify";
import { Eye, EyeOff, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [adminSecret, setAdminSecret] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const { setAToken, getAllDoctors, backendUrl } = useContext(AdminContext);
  const { loginDoctor } = useContext(DoctorContext);
  const { loginStaff } = useContext(StaffContext);
  const navigate = useNavigate();

  // Check if admin exists
  useEffect(() => {
    if (!backendUrl) return;

    const checkAdmin = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/admin/check-admin`);
        const data = await res.json();

        if (data.success) setAdminExists(data.exists);
      } catch (err) {
        console.error("Error checking admin:", err);
      }
    };

    checkAdmin();
  }, [backendUrl]);

  // Normal login
  const handleLogin = async () => {
    try {
      // Admin login
      const adminRes = await fetch(`${backendUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const adminData = await adminRes.json();
      if (adminData.success && adminData.token) {
        setAToken(adminData.token);
        localStorage.setItem("aToken", adminData.token);
        await getAllDoctors();
        toast.success("Admin login successful!");
        navigate("/dashboard");
        return;
      }

      // Doctor login
      const doctorResult = await loginDoctor(email, password);
      if (doctorResult.success) {
        toast.success("Doctor login successful!");
        navigate("/doctor-dashboard");
        return;
      }

      // Staff login
      const staffResult = await loginStaff(email, password);
      if (staffResult.success) {
        toast.success("Staff login successful!");
        navigate("/staff-dashboard");
        return;
      }

      // All failed
      toast.error("Invalid credentials for all roles");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit for normal login
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    handleLogin();
  };

  // Create first admin account
  const handleCreateAdmin = async () => {
    if (!backendUrl) return;
    if (!email || !password || !adminSecret) {
      toast.error("Please provide email, password, and admin secret");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/user/verify-and-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin",
          email,
          password,
          phone: "09123456789",
          dob: "2000-01-01",
          phoneOtp: "1234", // placeholder OTP for first admin
          isAdmin: true,
          adminSecret,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Admin account created!");
        setAToken(data.token);
        localStorage.setItem("aToken", data.token);
        await getAllDoctors();
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Failed to create admin");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating admin account");
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
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Smart Dental Clinic</h1>
          <p className="text-sm text-gray-500 mt-1">Management System</p>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login to Your Account
        </h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Password Input */}
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

        {/* Buttons */}
        {adminExists && !isCreatingAdmin ? (
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition shadow-md ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        ) : !adminExists && !isCreatingAdmin ? (
          <button
            type="button"
            onClick={() => setIsCreatingAdmin(true)}
            className="w-full py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700"
          >
            Create Admin Account
          </button>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Admin Secret Key
              </label>
              <input
                type="password"
                placeholder="Enter admin secret"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleCreateAdmin}
              className={`w-full py-3 rounded-lg text-white font-semibold transition shadow-md ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Creating..." : "Register Admin"}
            </button>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            © 2025 Smart Dental Clinic. All rights reserved.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
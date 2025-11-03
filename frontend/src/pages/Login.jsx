import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { API_URL } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
  });

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      const cleaned = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, phone: cleaned });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.phone || !formData.dob || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^09\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 11-digit number starting with 09");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/users/send-otp`,
        { phone: formData.phone }
      );

      console.log("[DEBUG] send-otp:", res.data);

      if (res.data.success) {
        setPhoneOtpSent(true);
        setSuccess("OTP sent to your phone! Check your SMS.");
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("[ERROR] OTP send failed:", err);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phoneOtp || phoneOtp.length !== 6) {
      setError("Please enter the 6-digit phone OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/users/verify-and-register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dob: formData.dob,
          phoneOtp: phoneOtp,
        }
      );

      console.log("[DEBUG] verify-and-register response:", res.data);

      if (res.data.success) {
        setSuccess("Registration successful! Signing in...");
        // Store token if provided
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        await login(formData.email, formData.password);
        navigate("/");
      } else {
        setError(res.data.message || "Invalid OTP or registration failed.");
      }
    } catch (err) {
      console.error("[ERROR] Registration failed:", err);
      setError(err.response?.data?.message || "Invalid OTP or registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      console.error("[ERROR] Sign In Failed:", err);
      setError(err.response?.data?.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transition-all">
        <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {mode === "signup"
            ? phoneOtpSent
              ? "Enter the OTP sent to your phone"
              : "Fill in your details to get started"
            : "Sign in to continue"}
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 text-center p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-100 text-green-700 text-center p-2 rounded mb-4 text-sm">
            {success}
          </p>
        )}

        {mode === "signup" && !phoneOtpSent && (
          <form onSubmit={handleSendPhoneOtp} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              name="phone"
              placeholder="09XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              minLength="11"
              maxLength="11"
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                max={today}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Phone OTP"}
            </button>
          </form>
        )}

        {mode === "signup" && phoneOtpSent && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              ✓ OTP sent to {formData.phone}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP Code
              </label>
              <input
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                className="w-full border text-center text-lg tracking-widest rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPhoneOtpSent(false);
                setPhoneOtp("");
                setError("");
                setSuccess("");
              }}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all text-sm"
            >
              Start Over
            </button>
          </form>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setSuccess("");
              setPhoneOtpSent(false);
              setPhoneOtp("");
            }}
            className="text-blue-500 hover:underline text-sm font-medium"
          >
            {mode === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
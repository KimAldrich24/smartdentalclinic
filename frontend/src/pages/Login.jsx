import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { API_URL } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Mode can be "login" or "signup"
  const [mode, setMode] = useState("login");

  // Loading state for buttons
  const [loading, setLoading] = useState(false);

  // OTP related states
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");

  // Feedback messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Show/hide password toggle
  const [showPassword, setShowPassword] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
  });

  // ID photo state
  const [idPhoto, setIdPhoto] = useState(null);
  const [idError, setIdError] = useState("");

  // Age warning state
  const [ageWarning, setAgeWarning] = useState("");

  // Max date for DOB (18+)
  const todayDate = new Date();
  const eighteenYearsAgo = new Date(
    todayDate.getFullYear() - 18,
    todayDate.getMonth(),
    todayDate.getDate()
  );
  const maxDob = eighteenYearsAgo.toISOString().split("T")[0]; // YYYY-MM-DD

  // Load saved registration data from session storage on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("registrationData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);

      // Restore OTP sent state if previously sent
      if (sessionStorage.getItem("phoneOtpSent") === "true") {
        setPhoneOtpSent(true);
      }
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    if (e.target.name === "phone") {
      // Only allow digits for phone
      const cleaned = e.target.value.replace(/\D/g, "");
      setFormData({ ...formData, phone: cleaned });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle ID upload
  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setIdError("Only JPG or PNG files are allowed.");
        setIdPhoto(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setIdError("File size must be less than 5MB.");
        setIdPhoto(null);
        return;
      }
      setIdError("");
      setIdPhoto(file);
    }
  };

  // Handle sending phone OTP
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.dob ||
      !formData.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    // Validate age 18+
    const birthDate = new Date(formData.dob);
    const todayDate = new Date();
    let age = todayDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = todayDate.getMonth() - birthDate.getMonth();
    const dayDiff = todayDate.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    if (age < 18) {
      setError("You must be at least 18 years old to create an account.");
      return;
    }

    // Validate phone number
    if (!/^09\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 11-digit number starting with 09");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Validate ID upload
    if (!idPhoto) {
      setError("Please upload a valid ID photo before proceeding.");
      return;
    }

    setLoading(true);

    try {
      // Save form data in session storage
      sessionStorage.setItem("registrationData", JSON.stringify(formData));

      // Send OTP request to backend with ID
      const form = new FormData();
      form.append("phone", formData.phone);
      form.append("idPhoto", idPhoto);

      const res = await axios.post(`${API_URL}/api/users/send-otp`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[DEBUG] send-otp:", res.data);

      if (res.data.success) {
        setPhoneOtpSent(true);
        sessionStorage.setItem("phoneOtpSent", "true");
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

  // Handle verifying OTP and registering user
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
      const savedData = sessionStorage.getItem("registrationData");
      const dataToSend = savedData ? JSON.parse(savedData) : formData;

      console.log("[DEBUG] Sending registration data:", dataToSend);

      const res = await axios.post(`${API_URL}/api/users/verify-and-register`, {
        name: dataToSend.name,
        email: dataToSend.email,
        password: dataToSend.password,
        phone: dataToSend.phone,
        dob: dataToSend.dob,
        phoneOtp: phoneOtp,
      });

      console.log("[DEBUG] verify-and-register response:", res.data);

      if (res.data.success) {
        setSuccess("Registration successful! Signing in...");
        sessionStorage.removeItem("registrationData");
        sessionStorage.removeItem("phoneOtpSent");

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        await login(dataToSend.email, dataToSend.password);
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

  // Handle login form submission
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

        {/* ERROR & SUCCESS MESSAGES */}
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

        {/* SIGNUP FORM - STEP 1: SEND OTP */}
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
            <p className="text-sm text-red-700 mt-1">
              Note: Smart/TNT numbers currently have no service. Other carriers can proceed.
            </p>

            {/* DOB */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                max={maxDob}
                onChange={(e) => {
                  setFormData({ ...formData, dob: e.target.value });
                  const birthDate = new Date(e.target.value);
                  const todayDate = new Date();
                  let age = todayDate.getFullYear() - birthDate.getFullYear();
                  const monthDiff = todayDate.getMonth() - birthDate.getMonth();
                  const dayDiff = todayDate.getDate() - birthDate.getDate();
                  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
                  if (age < 18) {
                    setAgeWarning("You must be at least 18 years old to create an account.");
                  } else {
                    setAgeWarning("");
                  }
                }}
                required
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {ageWarning && (
                <p className="text-red-600 text-sm mt-1">{ageWarning}</p>
              )}
            </div>

            {/* ID Upload */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Upload Valid ID (JPG/PNG, max 5MB)
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleIdUpload}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {idError && <p className="text-red-600 text-sm mt-1">{idError}</p>}
              {idPhoto && <p className="text-green-600 text-sm mt-1">ID selected: {idPhoto.name}</p>}
            </div>

            {/* Password */}
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

        {/* SIGNUP FORM - STEP 2: VERIFY OTP */}
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
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
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
                setIdPhoto(null);
                setIdError("");
                sessionStorage.removeItem("registrationData");
                sessionStorage.removeItem("phoneOtpSent");
              }}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all text-sm"
            >
              Start Over
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
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

        {/* SWITCH MODE BUTTON */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setSuccess("");
              setPhoneOtpSent(false);
              setPhoneOtp("");
              setIdPhoto(null);
              setIdError("");
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

import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js";

const doctorAuthMiddleware = async (req, res, next) => {
  try {
    // ✅ 1. Skip auth when disabled in .env
    if (process.env.AUTH_ENABLED === "false") {
      console.log("🔓 Auth disabled — doctorAuthMiddleware bypassed");

      // Simulate a logged-in doctor
      req.doctor = {
        _id: "dev-doctor-id",
        name: "Dr. Dev Test",
        email: "doctor@example.com",
        role: "doctor",
      };

      return next();
    }

    // ✅ 2. Normal JWT verification when auth is enabled
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const doctor = await Doctor.findById(decoded.id).select("-password");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    console.error("doctorAuthMiddleware error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default doctorAuthMiddleware;

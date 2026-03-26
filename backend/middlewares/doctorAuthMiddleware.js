import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js";

const doctorAuthMiddleware = async (req, res, next) => {
  try {
    if (process.env.AUTH_ENABLED === "false") {
      console.log("🔓 Auth disabled — doctorAuthMiddleware bypassed");
      req.doctor = {
        _id: "dev-doctor-id",
        name: "Dr. Dev Test",
        email: "doctor@example.com",
        role: "doctor",
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1].trim(); // ✅ trim trailing spaces
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Handle any field name used during signing
    const doctorId = decoded.id || decoded._id || decoded.doctorId;
    if (!doctorId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const doctor = await Doctor.findById(doctorId).select("-password");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    req.doctor = doctor;
    req.doctorId = doctor._id; // ✅ attach both for convenience
    next();
  } catch (error) {
    console.error("doctorAuthMiddleware error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default doctorAuthMiddleware;
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try User first
    let user = await User.findById(decoded.id).select("-password");

    // If not found, try Doctor
    if (!user) {
      user = await Doctor.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // attach either User or Doctor
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default verifyToken;
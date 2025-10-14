import jwt from "jsonwebtoken";
import Doctor from "../models/doctorModel.js";

const doctorAuthMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.doctor = await Doctor.findById(decoded.id).select("-password");
      if (!req.doctor)
        return res.status(404).json({ success: false, message: "Doctor not found" });
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  } else {
    res.status(401).json({ success: false, message: "Authorization token missing" });
  }
};

export default doctorAuthMiddleware;

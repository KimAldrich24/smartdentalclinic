import jwt from "jsonwebtoken";

const adminAuthMiddleware = async (req, res, next) => {
  try {
    console.log("🔐 adminAuthMiddleware - Checking authorization...");
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided");
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token decoded:", decoded);

    // Check if admin or staff
    if (!decoded.role || !["admin", "staff"].includes(decoded.role)) {
      console.log("❌ Access denied - not admin/staff");
      return res.status(403).json({ success: false, message: "Access denied - admin/staff only" });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    console.log("✅ Admin auth passed, user:", req.user);
    next();
  } catch (err) {
    console.error("❌ adminAuthMiddleware error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuthMiddleware;
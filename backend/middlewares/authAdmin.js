import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  try {
    // ✅ Allow bypass for dev/testing
    if (process.env.AUTH_ENABLED === "false") {
      req.user = {
        id: "dev-admin-id",
        role: "admin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        name: "Development Admin",
      };
      return next();
    }

    // ✅ Normal JWT auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    req.user = { id: decoded.id, role: "admin", email: decoded.email };
    next();
  } catch (error) {
    console.error("authAdmin error:", error.message);
    return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
  }
};

export default authAdmin;

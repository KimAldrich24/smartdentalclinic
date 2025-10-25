import AuditTrail from "../models/auditModel.js";

export const recordAudit = async (req, action, module) => {
  try {
    // ✅ If auth is disabled, fake a user for audit logs
    const isAuthDisabled = process.env.AUTH_ENABLED === "false";

    const user = req.user || (isAuthDisabled
      ? {
          _id: "dev-user-id",
          role: "admin",
          name: "Development User",
          email: "dev@example.com",
        }
      : null);

    // Skip only if no user in production mode
    if (!user) return;

    await AuditTrail.create({
      userId: user._id,
      role: user.role,
      action,
      module,
      ipAddress: req.ip,
    });

    if (isAuthDisabled) {
      console.log(`📝 [DEV AUDIT] ${user.role} performed ${action} on ${module}`);
    }
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

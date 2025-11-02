import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const { token } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences (stored locally for demo)
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    appointmentUpdates: true,
  });

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res.data.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success("Notification preference updated");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings ⚙️</h1>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔒 Change Password
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                  className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength="6"
                  className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                minLength="6"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔔 Notification Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Email Reminders</h3>
                <p className="text-sm text-gray-600">
                  Receive appointment reminders via email
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle("emailReminders")}
                className={`relative w-14 h-7 rounded-full transition ${
                  notifications.emailReminders ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition transform ${
                    notifications.emailReminders ? "translate-x-7" : ""
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Appointment Updates</h3>
                <p className="text-sm text-gray-600">
                  Get notified about appointment changes or cancellations
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle("appointmentUpdates")}
                className={`relative w-14 h-7 rounded-full transition ${
                  notifications.appointmentUpdates ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition transform ${
                    notifications.appointmentUpdates ? "translate-x-7" : ""
                  }`}
                ></div>
              </button>
            </div>

            {/* SMS Info (non-toggleable) */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">📱</span>
                <div>
                  <h3 className="font-medium text-blue-900">SMS Notifications</h3>
                  <p className="text-sm text-blue-700">
                    SMS reminders are automatically sent for all appointments and cannot be disabled.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            💡 Your notification preferences help us keep you informed about your dental appointments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
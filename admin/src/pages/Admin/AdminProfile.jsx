import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { 
  User, Mail, Calendar, Shield, Phone, Edit2, X, Check, Eye, EyeOff 
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { backendUrl } from "../../config";

const AdminProfile = () => {
  const { aToken } = useContext(AdminContext) || {};

  const [admin, setAdmin] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Decode token to get admin info
  useEffect(() => {
    if (aToken) {
      try {
        const decoded = JSON.parse(atob(aToken.split(".")[1]));
        fetchAdminProfile(decoded.id);
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, [aToken]);

  // Fetch admin profile
  const fetchAdminProfile = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${aToken}` },
    });

    if (res.data.success) {
      setAdmin(res.data.admin);
      setFormData({
        name: res.data.admin.name || "",
        phone: res.data.admin.phone || "",
      });
    } else {
      throw new Error(res.data.message);
    }
  } catch (err) {
    console.error("Fetch profile error:", err);

    // Fallback: use token data if backend fails
    try {
      const decoded = JSON.parse(atob(aToken.split(".")[1]));
      setAdmin({
        id: decoded.id,
        name: decoded.name || "Admin User",
        email: decoded.email || "Not set",
        phone: decoded.phone || "Not set",
        role: decoded.role,
        status: "active",
      });
      setFormData({
        name: decoded.name || "Admin User",
        phone: decoded.phone || "Not set",
      });
    } catch (decodeErr) {
      console.error("Fallback failed:", decodeErr);
    }
  }
};

  // Handle profile input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save profile updates
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/profile`,
        formData,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setAdmin(res.data.admin);
        setIsEdit(false);
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: admin?.name || "",
      phone: admin?.phone || "",
    });
    setIsEdit(false);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Handle change password submit
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (res.data.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        toast.error(res.data.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="flex justify-center items-center my-auto mx-auto h-[50dvh]">
        <ClipLoader color="#36d7b7" loading={true} size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
          {!isEdit ? (
            <button
              onClick={() => setIsEdit(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <Check size={18} />
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-full mb-4 shadow-lg">
            <User size={80} className="text-white" />
          </div>

          {isEdit ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-2xl font-semibold text-gray-800 text-center border-b-2 border-blue-400 focus:outline-none px-4 py-2"
              placeholder="Admin Name"
            />
          ) : (
            <h2 className="text-3xl font-bold text-gray-800">{admin.name}</h2>
          )}

          <div className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Administrator
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Email Address</p>
              <p className="text-gray-800 font-semibold">{admin.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-3 rounded-full">
              <Phone className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Phone Number</p>
              {isEdit ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-800 font-semibold">
                  {admin.phone || "Not set"}
                </p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-3 rounded-full">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Role</p>
              <p className="text-gray-800 font-semibold">
                {admin.role?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Calendar className="text-yellow-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Account Status</p>
              <p className="text-gray-800 font-semibold">
                <span className="text-green-600">● Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="mt-6">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Change Password
            </button>
          ) : (
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Current Password"
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <span
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="New Password"
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <span
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm New Password"
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <span
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={pwdLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {pwdLoading ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    disabled={pwdLoading}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As an administrator, you have full access to manage doctors,
            staff, appointments, and system settings. Email address cannot be changed for
            security reasons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
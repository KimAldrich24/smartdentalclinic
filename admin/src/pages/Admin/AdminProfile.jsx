import React, { useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { User, Mail, Calendar, Shield, Phone, Edit2, X, Check } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminProfile = () => {
  const { admin, aToken } = useContext(AdminContext) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    phone: admin?.phone || "",
  });

  // Handle input change
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
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setIsEdit(false);
        // You might want to refresh admin data here
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
            <h2 className="text-3xl font-bold text-gray-800">
              {admin?.name || "Admin User"}
            </h2>
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
              <p className="text-gray-800 font-semibold">
                {admin?.email || "admin@smartdental.com"}
              </p>
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
                  {admin?.phone || "Not set"}
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
                {admin?.role?.toUpperCase() || "ADMIN"}
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
                {admin?.status === "active" ? (
                  <span className="text-green-600">● Active</span>
                ) : (
                  <span className="text-red-600">● Inactive</span>
                )}
              </p>
            </div>
          </div>

          {/* Created At */}
          {admin?.createdAt && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Calendar className="text-indigo-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Member Since</p>
                <p className="text-gray-800 font-semibold">
                  {new Date(admin.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
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
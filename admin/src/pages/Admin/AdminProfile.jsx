import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { User, Mail, Calendar, Shield, Phone, Edit2, X, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminProfile = () => {
  const { aToken } = useContext(AdminContext) || {};
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [admin, setAdmin] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);

  // 👁 visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Decode token
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

  const fetchAdminProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (res.data.success) {
        setAdmin(res.data.user);
        setFormData({
          name: res.data.user.name || "",
          phone: res.data.user.phone || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/profile`,
        formData,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (res.data.success) {
        toast.success("Profile updated successfully");
        setAdmin(res.data.admin);
        setIsEdit(false);
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: admin?.name || "",
      phone: admin?.phone || "",
    });
    setIsEdit(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
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
        toast.success("Password changed successfully");

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setPwdLoading(false);
    }
  };

  if (!admin) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Profile</h1>

          {!isEdit ? (
            <button
              onClick={() => setIsEdit(true)}
              className="flex gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              <Edit2 size={18}/> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                <Check size={18}/> Save
              </button>

              <button
                onClick={handleCancel}
                className="flex gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                <X size={18}/> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500 p-6 rounded-full mb-3">
            <User size={80} className="text-white"/>
          </div>

          {isEdit ? (
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border-b text-2xl text-center"
            />
          ) : (
            <h2 className="text-3xl font-bold">{admin.name}</h2>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">

          <div className="flex gap-4 bg-gray-50 p-4 rounded-lg">
            <Mail className="text-blue-500"/>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{admin.email}</p>
            </div>
          </div>

          <div className="flex gap-4 bg-gray-50 p-4 rounded-lg">
            <Phone className="text-green-500"/>
            <div className="w-full">
              <p className="text-sm text-gray-500">Phone</p>

              {isEdit ? (
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full"
                />
              ) : (
                <p>{admin.phone || "Not set"}</p>
              )}

            </div>
          </div>

          <div className="flex gap-4 bg-gray-50 p-4 rounded-lg">
            <Shield className="text-purple-500"/>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p>{admin.role?.toUpperCase()}</p>
            </div>
          </div>

        </div>

        {/* CHANGE PASSWORD */}
        {showPasswordForm && (
          <div className="mt-8 border rounded-lg p-6">

            <h3 className="text-xl font-semibold mb-4">Change Password</h3>

            <div className="space-y-4">

              {/* CURRENT */}
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                />

                <button
                  type="button"
                  onClick={()=>setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showCurrent ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>

              {/* NEW */}
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                />

                <button
                  type="button"
                  onClick={()=>setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showNew ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>

              {/* CONFIRM */}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm Password"
                  className="w-full border rounded-lg px-3 py-2 pr-10"
                />

                <button
                  type="button"
                  onClick={()=>setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={pwdLoading}
                className="w-full bg-red-500 text-white py-2 rounded-lg"
              >
                {pwdLoading ? "Changing..." : "Change Password"}
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProfile;
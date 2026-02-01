import React, { useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const DoctorChangePassword = () => {
  const { dToken, logoutDoctor } = useContext(DoctorContext);
  const { backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.put(
        `${backendUrl}/api/doctors/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Password updated. Please login again.");
        logoutDoctor();
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-start justify-center px-4 pt-12">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          🔒 Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorChangePassword;

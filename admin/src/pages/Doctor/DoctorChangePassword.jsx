import React, { useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">🔒 Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Current Password"
          className="w-full border p-2 rounded"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border p-2 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default DoctorChangePassword;

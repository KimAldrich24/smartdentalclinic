// src/pages/Admin/UserMaintenance.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const UserMaintenance = () => {
  const { aToken, doctors, getAllDoctors } = useContext(AdminContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);

  // =========================
  // 🔥 FETCH PATIENTS
  // =========================
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/users`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      const nonAdminUsers = (res.data.users || []).filter(
        (user) => user.role !== "admin"
      );

      setPatients(nonAdminUsers);
    } catch (err) {
      console.error(
        "Error fetching users:",
        err.response?.data || err.message
      );
    }
  };

  // =========================
  // 🔥 DELETE USER
  // =========================
  const deleteUser = async (id, role) => {
    try {
      if (role === "doctor") {
        console.log("Doctor delete not implemented yet");
        return;
      }

      await axios.delete(`${backendUrl}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      setPatients((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // =========================
  // 🔥 FETCH STAFF
  // =========================
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (res.data.success) {
        setStaff(res.data.staff);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  // =========================
  // 🔥 FETCH ALL ON LOAD
  // =========================
  useEffect(() => {
    if (aToken) {
      fetchUsers();
      getAllDoctors();
      fetchStaff();
    }
  }, [aToken]);

  // =========================
  // 🔥 MERGE DATA
  // =========================
  const allUsers = [
    ...patients.map((u) => ({ ...u, role: "patient" })),
    ...doctors.map((doc) => ({ ...doc, role: "doctor" })),
    ...staff.map((s) => ({ ...s, role: "receptionist" })),
  ];

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">User Maintenance</h2>

      {/* 🔹 Add Doctor & Receptionist Buttons (Emoji version) */}
      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={() => navigate("/add-doctor")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <span>➕</span>
          <span>Add Dentist</span>
        </button>

        <button
          onClick={() => navigate("/staff-management")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          <span>👥</span>
          <span>Receptionist</span>
        </button>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            {/* <th className="p-2 border">Actions</th> */}
          </tr>
        </thead>

        <tbody>
          {allUsers.length > 0 ? (
            allUsers.map((user) => (
              <tr key={user._id}>
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border capitalize">{user.role}</td>

                <td className="p-2 border">
                  <button
                    onClick={() => deleteUser(user._id, user.role)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-2 text-center border">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserMaintenance;
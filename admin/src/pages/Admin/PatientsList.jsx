import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // ✅ Get token from localStorage (or context if you use AuthContext/AdminContext)
        const token = localStorage.getItem("aToken");

        const { data } = await axios.get(`${backendUrl}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Attach token to request
          },
        });

        if (data.success) setPatients(data.users);
      } catch (err) {
        console.error(
          "Error fetching patients:",
          err.response?.data || err.message
        );
      }
    };
    fetchPatients();
  }, [backendUrl]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Patients</h2>
      <table className="w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((user) => (
            <tr key={user._id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.phone || "N/A"}</td>
              <td className="border p-2">
                <button
                  onClick={() =>
                    navigate(`/admin/patient-history/${user._id}`)
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;

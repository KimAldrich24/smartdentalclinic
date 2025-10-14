import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const UserRecords = () => {
  const { user, token } = useContext(AuthContext); // ✅ get logged in user
  const [records, setRecords] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchRecords = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/patient-records/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setRecords(data.records);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load records");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🩺 My Treatment History</h2>

      {records.length === 0 ? (
        <p className="text-gray-500">No records found yet.</p>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec._id} className="border rounded-lg p-4 bg-white shadow-md">
              <h3 className="text-lg font-semibold">{rec.service?.name}</h3>
              <p className="text-sm text-gray-600">
                Doctor: {rec.doctor?.name} | Date: {new Date(rec.date).toLocaleDateString()}
              </p>
              <p className="mt-2 text-gray-700">{rec.notes || "No additional notes"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRecords;

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // ✅ ADD THIS
import { AuthContext } from "../../context/AuthContext";
import { AdminContext } from "../../context/AdminContext"; // ✅ ADD THIS

const PatientHistory = () => {
  const { user, token } = useContext(AuthContext); // patient context
  const { aToken } = useContext(AdminContext); // ✅ admin context
  const { id } = useParams(); // ✅ get patient ID from URL
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Determine which ID and token to use
  const patientId = id || user?._id; // URL param takes priority
  const authToken = aToken || token; // admin token or patient token

  console.log("🔍 PatientHistory component loaded");
  console.log("👤 Patient ID from URL:", id);
  console.log("👤 Patient ID from context:", user?._id);
  console.log("📍 Using Patient ID:", patientId);
  console.log("🔑 Using Token:", authToken);
  
  useEffect(() => {
    const fetchRecords = async () => {
      if (!patientId) {
        console.log("❌ No patient ID available");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/patient-records/${patientId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        console.log("📦 Patient Records Response:", res.data);
        setRecords(res.data.records || []);
      } catch (error) {
        console.error("❌ Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, authToken]);

  if (loading) return <p>Loading records...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">🦷 Tooth History</h2>
      {records.length === 0 ? (
        <p>No completed dental history found.</p>
      ) : (
        <ul className="space-y-4">
          {records.map((record) => (
            <li
              key={record._id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {record.doctor?.name || "N/A"}</p>
              <p><strong>Notes:</strong> {record.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientHistory;
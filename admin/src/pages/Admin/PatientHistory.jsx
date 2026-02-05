import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AdminContext } from "../../context/AdminContext";

const PatientHistory = () => {
  const { user, token } = useContext(AuthContext); // patient context
  const { aToken } = useContext(AdminContext); // admin context
  const { id } = useParams(); // get patient ID from URL

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine which ID and token to use
  const patientId = id || user?._id;
  const authToken = aToken || token;

  useEffect(() => {
    const fetchRecords = async () => {
      if (!patientId) {
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

        setRecords(res.data.records || []);
      } catch (error) {
        console.error("❌ Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, authToken]);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">
        Loading records...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
        🦷 Tooth History
      </h2>

      {records.length === 0 ? (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
          No completed dental history found.
        </div>
      ) : (
        <ul className="space-y-3 sm:space-y-4">
          {records.map((record) => (
            <li
              key={record._id}
              className="p-4 border rounded-xl shadow-sm bg-white flex flex-col gap-2 text-sm sm:text-base"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <p className="font-medium text-gray-800">
                  📅 {new Date(record.date).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  👨‍⚕️ {record.doctor?.name || "N/A"}
                </p>
              </div>

              <div className="text-gray-700 leading-relaxed">
                <span className="font-medium">Notes:</span>{" "}
                {record.notes || "No notes provided."}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientHistory;

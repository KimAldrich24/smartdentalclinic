import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AdminContext } from "../../context/AdminContext";

const PatientHistory = () => {
  const { user, token } = useContext(AuthContext);
  const { aToken } = useContext(AdminContext);
  const { id } = useParams();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, authToken]);

  if (loading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Loading records...
      </div>
    );
  }

  return (
    // ✅ KEY FIX: force width + allow scroll
    <div className="w-full max-w-full overflow-x-auto">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          🦷 Tooth History
        </h2>

        {records.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
            No completed dental history found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {records.map((record) => (
              <div
                key={record._id}
                className="w-full bg-white border rounded-xl shadow-sm p-4 text-sm sm:text-base"
              >
                <div className="flex flex-col gap-1 mb-2">
                  <div className="font-semibold text-gray-800">
                    📅 {new Date(record.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    👨‍⚕️ {record.doctor?.name || "N/A"}
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed break-words">
                  <span className="font-medium">Notes:</span>{" "}
                  {record.notes || "No notes provided."}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;

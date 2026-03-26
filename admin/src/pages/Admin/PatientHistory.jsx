import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AdminContext } from "../../context/AdminContext";
import { backendUrl } from "../../config";

const PatientHistory = () => {
  const { user, token } = useContext(AuthContext);
  const { aToken } = useContext(AdminContext);
  const { id } = useParams();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decide which ID and token to use
  const patientId = id || user?._id;
  const authToken = aToken || token;

  useEffect(() => {
    const fetchRecords = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        // Choose route based on admin or patient
        const url = aToken
          ? `${backendUrl}/api/appointments/admin/completed/${patientId}`
          : `${backendUrl}/api/appointments/completed/${patientId}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Admin and patient route returns `records`
        setRecords(res.data.records || res.data.appointments || []);
      } catch (err) {
        console.error(
          "Error fetching patient appointments:",
          err.response?.data || err.message
        );
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [patientId, authToken, aToken]);

  if (loading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Loading patient appointments...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-3 sm:px-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        🦷 Patient Dental History
      </h2>

      {records.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-4 text-center text-sm text-gray-500">
          No completed appointments available.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((record) => (
            <div
              key={record._id}
              className="w-full bg-white border rounded-2xl shadow-sm p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-gray-800">
                  📅 {new Date(record.date).toLocaleDateString()} 🕒 {record.time}
                </div>
                <div className="text-xs text-gray-500 text-right">
                  👨‍⚕️ {record.doctor?.name || "N/A"}
                </div>
              </div>

              {/* Notes */}
              <div className="text-sm text-gray-700 leading-relaxed break-words">
                <span className="font-semibold text-gray-800">Notes:</span>
                <div className="mt-1">{record.notes || "No notes provided."}</div>
              </div>

              {/* Services */}
              {record.services && record.services.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Services:</span>
                  <ul className="list-disc pl-5 mt-1">
                    {record.services.map((s, idx) => (
                      <li key={idx}>
                        {s.service?.name || "Unknown Service"} - ₱{s.price || "N/A"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment Info */}
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Total Price:</span> ₱{record.totalPrice || 0} <br />
                <span className="font-semibold">Payment Status:</span>{" "}
                {record.paymentStatus || "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;

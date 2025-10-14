import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PatientHistory = () => {
  const { id } = useParams(); // dynamic patient ID
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/patient-records/${id}`);
        if (data.success) {
          setHistory(data.records);
        } else {
          setError("No history found.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading patient history...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Patient Dental History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No dental records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Service</th>
                <th className="border p-2">Doctor</th>
                <th className="border p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="border p-2">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="border p-2">{record.service?.name || "N/A"}</td>
                  <td className="border p-2">{record.doctor?.name || "N/A"}</td>
                  <td className="border p-2">{record.notes || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;

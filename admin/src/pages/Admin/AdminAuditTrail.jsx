import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminAuditTrail = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/audit`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [aToken, backendUrl]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>

      {loading ? (
        <p className="text-gray-500">Loading audit logs...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No audit logs available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Action</th>
                <th className="px-4 py-2 border">Module</th>
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 text-center">
                  <td className="px-4 py-2 border">{log.userId?.name || "N/A"}</td>
                  <td className="px-4 py-2 border">{log.role || "-"}</td>
                  <td className="px-4 py-2 border">{log.action || "-"}</td>
                  <td className="px-4 py-2 border">{log.module || "-"}</td>
                  <td className="px-4 py-2 border">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 border">{log.ipAddress || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditTrail;

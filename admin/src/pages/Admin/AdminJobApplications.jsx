import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AdminJobApplications = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/job-applications`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setApplications(data);
      } catch (error) {
        console.error("Failed to fetch job applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [backendUrl, aToken]);

  if (loading) {
    return <p className="text-center mt-8 text-gray-600">Loading applications...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Job Applications
      </h2>

      {applications.length === 0 ? (
        <p className="text-gray-600">No job applications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Position</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{app.name}</td>
                  <td className="p-3">{app.email}</td>
                  <td className="p-3">{app.phone}</td>
                  <td className="p-3">{app.position}</td>
                  <td className="p-3 text-gray-600">
                    {app.message || <em>No message</em>}
                  </td>
                  <td className="p-3">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminJobApplications;

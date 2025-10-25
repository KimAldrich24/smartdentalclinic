import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { aToken, setAToken, backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin-login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/dashboard/stats`, { headers: { Authorization: `Bearer ${aToken}` } });
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired. Please log in again.");
          setAToken("");
          navigate("/admin-login");
        }
      }
    };

    const fetchRecent = async () => {
      try {
        const res = await axios.get(`${backendUrl}/dashboard/recent-appointments`, { headers: { Authorization: `Bearer ${aToken}` } });
        setRecentAppointments(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired. Please log in again.");
          setAToken("");
          navigate("/admin-login");
        }
      }
    };

    fetchStats();
    fetchRecent();
  }, [aToken, backendUrl, navigate, setAToken]);

  if (!stats) return <p className="p-6">Loading dashboard...</p>;

  const COLORS = ["#0088FE", "#FF69B4", "#00C49F", "#FFBB28"];

  return (
    <div className="p-6 grid gap-6">
      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow"><h2>Total Patients</h2><p>{stats.totalPatients || 0}</p></div>
        <div className="bg-white p-4 rounded-xl shadow"><h2>Appointments</h2><p>{stats.totalAppointments || 0}</p></div>
        <div className="bg-white p-4 rounded-xl shadow"><h2>Revenue</h2><p>₱{stats.revenue?.toLocaleString() || 0}</p></div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2>Appointments Per Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyAppointments || []}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="_id" tickFormatter={m => `Month ${m}`} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2>Patient Demographics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.demographics || []} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                {(stats.demographics || []).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Appointments */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2>Recent Appointments</h2>
        {recentAppointments.length === 0 ? (
          <p>No recent appointments found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Patient</th>
                <th className="border p-2">Doctor</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map(a => (
                <tr key={a._id}>
                  <td className="border p-2">{a.user?.name || "N/A"}</td>
                  <td className="border p-2">{a.doctor?.name || "N/A"}</td>
                  <td className="border p-2">{a.date ? new Date(a.date).toLocaleString() : "Unknown"}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded ${
                      a.status === 'completed' ? 'bg-green-100 text-green-800' :
                      a.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {a.status || "Unknown"}
                    </span>
                  </td>
                  <td className="border p-2 font-semibold">
                    ₱{a.finalPrice?.toLocaleString() || a.service?.price?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
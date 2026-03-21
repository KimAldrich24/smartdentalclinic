import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const { aToken, setAToken, backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin-login");
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${aToken}` }
        });
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired. Please log in again.");
          setAToken("");
          navigate("/admin-login");
        }
      }
    };

    // Fetch recent appointments
    const fetchRecent = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/dashboard/recent-appointments?status=all`, // include all statuses
          {
            headers: { Authorization: `Bearer ${aToken}` },
          }
        );
        setRecentAppointments(res.data.appointments || []); // ensure appointments array
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expired. Please log in again.");
          setAToken("");
          navigate("/admin-login");
        }
      }
    };

    // Fetch patient credits
    const fetchCredits = async () => {
      try {
        const res = await axios.get(`${backendUrl}/dashboard/credits`, {
          headers: { Authorization: `Bearer ${aToken}` }
        });
        setCredits(res.data); // expected: [{ user: {name, id}, amount, history }]
      } catch (err) {
        console.error("❌ Error fetching credits:", err.response?.data || err.message);
      }
    };

    fetchStats();
    fetchRecent();
    fetchCredits();
  }, [aToken, backendUrl, navigate, setAToken]);

  if (!stats) return <p className="p-4">Loading dashboard...</p>;

  const COLORS = ["#0088FE", "#FF69B4", "#00C49F", "#FFBB28"];

  return (
    <div className="w-full max-w-full overflow-x-hidden p-3 md:p-6 space-y-6">

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-xs text-gray-500">Total Patients</p>
          <p className="text-lg font-bold">{stats.totalPatients || 0}</p>
        </div>

        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-xs text-gray-500">Appointments</p>
          <p className="text-lg font-bold">{stats.totalAppointments || 0}</p>
        </div>

        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-lg font-bold">
            ₱{stats.revenue?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart */}
        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-sm font-semibold mb-2">Appointments Per Month</p>
          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyAppointments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#4F46E5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-3 rounded-xl shadow">
          <p className="text-sm font-semibold mb-2">Patient Demographics</p>
          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.demographics || []}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  label
                >
                  {(stats.demographics || []).map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= RECENT APPOINTMENTS ================= */}
      <div className="bg-white p-3 rounded-xl shadow">
        <p className="text-sm font-semibold mb-2">Recent Appointments</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-xs sm:text-sm border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Patient</th>
                <th className="border p-2">Doctor</th>
                <th className="border p-2">Services</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Total Price</th>
                <th className="border p-2">Payment Status</th>
                <th className="border p-2">Created By</th>
                <th className="border p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-3">
                    No recent appointments
                  </td>
                </tr>
              ) : (
                recentAppointments.map((a) => (
                  <tr key={a._id}>
                    <td className="border p-2">{a.user?.name || "N/A"}</td>
                    <td className="border p-2">{a.doctor?.name || "N/A"}</td>
                    <td className="border p-2">
                      {a.services?.length
                        ? a.services.map((s) => s.name).join(", ")
                        : "N/A"}
                    </td>
                    <td className="border p-2">
                      {a.date ? new Date(a.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="border p-2">{a.time || "N/A"}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-[10px] ${a.status?.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-800"
                            : a.status?.toLowerCase() === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : a.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {a.status || "Unknown"}
                      </span>
                    </td>
                    <td className="border p-2 font-semibold">
                      ₱{((a.totalPrice || 0) + (a.additionalPayment || 0)).toLocaleString()}
                    </td>
                    <td className="border p-2">{a.paymentStatus || "N/A"}</td>
                    <td className="border p-2">{a.createdBy?.name || "N/A"}</td>
                    <td className="border p-2">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PATIENT CREDITS =================
      <div className="bg-white p-3 rounded-xl shadow">
        <p className="text-sm font-semibold mb-2">Patient Credits</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Patient</th>
                <th className="border p-2">Credit Balance</th>
                <th className="border p-2">History Count</th>
              </tr>
            </thead>
            <tbody>
              {credits.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-3">No credit records</td>
                </tr>
              ) : (
                credits.map((c) => (
                  <tr key={c.user.id}>
                    <td className="border p-2">{c.user.name}</td>
                    <td className="border p-2 font-semibold">₱{c.amount.toLocaleString()}</td>
                    <td className="border p-2">{c.history?.length || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}

    </div>
  );
};

export default Dashboard;

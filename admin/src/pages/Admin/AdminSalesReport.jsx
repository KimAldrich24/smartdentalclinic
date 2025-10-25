import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminSalesReport = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [salesData, setSalesData] = useState([]);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);

  // Fetch sales data
  const fetchSales = async () => {
    if (!aToken) return;
    setLoading(true);

    try {
      const res = await axios.get(`${backendUrl}/api/sales/report`, {
        headers: { Authorization: `Bearer ${aToken}` },
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });

      if (res.data.success) {
        setSalesData(res.data.sales);
        setTotal(res.data.total);
      } else {
        setSalesData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("❌ Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg min-h-screen">
      <h2 className="text-2xl font-bold mb-6">💰 Sales Report</h2>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div>
          <label className="block text-sm text-gray-600">Start Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">End Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </div>

        <button
          onClick={fetchSales}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Filter
        </button>
      </div>

      {/* Summary */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-lg font-medium text-blue-800">
          Total Sales: ₱{total.toLocaleString()}
        </p>
        <p className="text-sm text-blue-700">Transactions: {salesData.length}</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-500 italic">Loading sales data...</p>
      ) : salesData.length === 0 ? (
        <p className="text-gray-500 italic">No sales data available.</p>
      ) : (
        <>
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={salesData.map((s) => ({
                name: new Date(s.date).toLocaleDateString(),
                amount: s.amount,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563EB"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Table */}
          <div className="overflow-x-auto mt-8">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Patient</th>
                  <th className="border p-2 text-left">Service</th>
                  <th className="border p-2 text-left">Dentist</th>
                  <th className="border p-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="border p-2">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="border p-2">{s.patientName}</td>
                    <td className="border p-2">{s.serviceName}</td>
                    <td className="border p-2">{s.dentistName || "N/A"}</td>
                    <td className="border p-2">
                      ₱{s.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSalesReport;

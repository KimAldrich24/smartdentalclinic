import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const AllAppointments = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  // 🔥 Filters
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setAppointments(data.appointments);
        setError(null);
      } else {
        setError(data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Delete
  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/appointments/${id}`,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        toast.success("Appointment deleted");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Mark as completed
  const markAsDone = async (appt) => {
    if (!window.confirm("Mark appointment as completed?")) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/appointments/${appt._id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      if (data.success) {
        toast.success("Appointment completed");
        fetchAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (aToken) fetchAppointments();
  }, [aToken, backendUrl]);

  // 🔥 APPLY FILTERS
  const filteredAppointments = appointments
    // Search
    .filter((appt) => {
      const term = searchTerm.toLowerCase();
      return (
        appt.user?.name?.toLowerCase().includes(term) ||
        appt.doctor?.name?.toLowerCase().includes(term)
      );
    })
    // Status
    .filter((appt) =>
      statusFilter === "all" ? true : appt.status === statusFilter
    )
    // Date Range
    .filter((appt) => {
      const apptDate = new Date(appt.date);
      if (startDate && apptDate < new Date(startDate)) return false;
      if (endDate && apptDate > new Date(endDate)) return false;
      return true;
    })
    // Sort
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (!aToken)
    return <p className="p-6 text-red-500">Admin login required.</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <p className="text-2xl font-semibold mb-4">All Appointments</p>

      {/* 🔥 FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search patient or doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        {/* End Date */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* LIST */}
      {filteredAppointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="grid gap-6">
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="flex flex-col md:flex-row gap-6 bg-white shadow rounded-xl p-5"
            >
              <img
                src={
                  appt.doctor?.image
                    ? `${backendUrl}/uploads/doctors/${appt.doctor.image}`
                    : "/placeholder-doctor.png"
                }
                alt="Doctor"
                className="w-32 h-32 object-cover rounded-lg"
              />

              <div className="flex-1">
                <p className="text-xl font-semibold">
                  Dr. {appt.doctor?.name}
                </p>
                <p className="text-gray-600">{appt.doctor?.speciality}</p>

                <p className="text-sm mt-2">
                  <b>Patient:</b> {appt.user?.name} ({appt.user?.email})
                </p>

                <p className="text-sm">
                  <b>Date:</b> {appt.date} | {appt.time}
                </p>

                <p className="text-sm">
                  <b>Status:</b>{" "}
                  <span
                    className={
                      appt.status === "completed"
                        ? "text-green-600"
                        : appt.status === "cancelled"
                        ? "text-red-500"
                        : "text-blue-500"
                    }
                  >
                    {appt.status}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {appt.status !== "completed" && (
                  <button
                    onClick={() => markAsDone(appt)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Mark as Done
                  </button>
                )}
                <button
                  onClick={() => deleteAppointment(appt._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
